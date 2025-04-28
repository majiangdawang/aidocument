"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { AiAssistant } from "@/components/ai-assistant"
import { AiEntryPoint } from "@/components/ai-entry-point"
import { PdfViewer } from "@/components/pdf-viewer"
import { TextAnnotation } from "@/components/text-annotation"
import { TextSelection } from "@/components/text-selection"
import { AiTextSelection } from "@/components/ai-text-selection"
import { AiCapabilityMenu } from "@/components/ai-capability-menu"
import { Plus, MessageSquare, FileText, Upload, CodeIcon } from "lucide-react"
// 删除这一行
// import { documentContent } from "@/lib/document-content"
import { SourceCodeEditor } from "@/components/source-code-editor"
import { AiChatInterface } from "@/components/ai-chat-interface"
import { TiptapEditor, type OutlineItem } from "@/components/tiptap-editor"
import { Sidebar } from "@/components/sidebar"
import { useDocumentNavigation } from "@/hooks/use-document-navigation"
import { useRequirementSpec } from "@/contexts/requirement-spec-context"
import { useProject } from "@/contexts/project-context"

interface DocumentViewerProps {
  onShowPrototype?: () => void
  onShowSourceDocument?: () => void
  onShowAiChat?: () => void
  isEmptyProject?: boolean
  initialContent?: string
  onContentChange?: (content: string) => void
}

export function DocumentViewer({
  onShowPrototype,
  onShowSourceDocument,
  onShowAiChat,
  isEmptyProject = false,
  initialContent,
  onContentChange,
}: DocumentViewerProps) {
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [showTextAnnotation, setShowTextAnnotation] = useState(false)
  const [showAiEntryPoint, setShowAiEntryPoint] = useState(false)
  const [showTextSelection, setShowTextSelection] = useState(false)
  const [showAiTextSelection, setShowAiTextSelection] = useState(false)
  const [showAiCapabilityMenu, setShowAiCapabilityMenu] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [textSelectionPosition, setTextSelectionPosition] = useState({ top: 0, left: 0 })
  const [showCitationArrow, setShowCitationArrow] = useState(false)
  const [showPrototypeArrow, setShowPrototypeArrow] = useState(false)
  // 将这一行
  // const [content, setContent] = useState(initialContent || (isEmptyProject ? "" : documentContent))
  // 修改为
  const [content, setContent] = useState(initialContent || "")
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [showSourceCodeEditor, setShowSourceCodeEditor] = useState(false)
  const [documentOutline, setDocumentOutline] = useState<OutlineItem[]>([])
  const { navigateToSection } = useDocumentNavigation(editorContainerRef)
  const { fetchSpecByVersion, specVersions, currentSpec, updateSpec } = useRequirementSpec()
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const { currentProject } = useProject()
  const contentUpdatedRef = useRef(false)

  useEffect(() => {
    if (initialContent && !contentUpdatedRef.current) {
      setContent(initialContent)
      contentUpdatedRef.current = true
    }
  }, [initialContent])

  // 添加这个useEffect
  useEffect(() => {
    if (currentSpec) {
      setContent(currentSpec.content)
      contentUpdatedRef.current = true
    }
  }, [currentSpec])

  const handleCitationClick = () => {
    setShowCitationArrow(true)
    setTimeout(() => {
      setShowCitationArrow(false)
      if (onShowSourceDocument) {
        onShowSourceDocument()
      }
    }, 1000)
  }

  const handlePrototypeClick = (id: string) => {
    setShowPrototypeArrow(true)
    setTimeout(() => {
      setShowPrototypeArrow(false)
      if (onShowPrototype) {
        onShowPrototype()
      }
    }, 1000)
  }

  const handleNavigate = (sectionId: string) => {
    navigateToSection(sectionId)
  }

  // Handle content changes with debouncing
  const debouncedContentChange = useCallback(
    debounce(async (newContent: string) => {
      // Call the parent's onContentChange if provided
      if (onContentChange) {
        onContentChange(newContent)
      }

      // Also directly update the spec if we have a current project and spec
      if (currentProject && currentSpec) {
        try {
          console.log("Saving content to version:", currentSpec.version)
          await updateSpec(currentProject.id, currentSpec.version, newContent)
          console.log("Content saved successfully")
        } catch (error) {
          console.error("Failed to update spec content:", error)
        }
      }
    }, 1000),
    [onContentChange, currentProject, currentSpec, updateSpec],
  )

  // Handle content updates from the editor
  const handleContentUpdate = useCallback(
    (newContent: string) => {
      setContent(newContent)
      debouncedContentChange(newContent)
    },
    [debouncedContentChange],
  )

  const handleVersionChange = async (version: number) => {
    if (!currentProject) return

    // Find the version in specVersions
    const versionStr = version.toString()
    const versionInfo = specVersions.find((v) => v.version === versionStr)

    if (versionInfo) {
      setSelectedVersion(versionStr)

      // Fetch the content for this version
      const spec = await fetchSpecByVersion(currentProject.id, versionStr)
      if (spec) {
        // Update the content state
        setContent(spec.content)
        contentUpdatedRef.current = true
      }
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <Sidebar onNavigate={handleNavigate} outline={documentOutline} onSectionClick={handleNavigate} />
      <div className="flex-1 p-8 overflow-auto" ref={editorContainerRef}>
        {isEmptyProject && !content ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">开始创建需求规格说明书</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              您可以上传需求材料或通过AI对话输入项目内容，我们将帮助您生成专业的需求规格说明书。
            </p>
            <div className="flex gap-4">
              <Button onClick={() => onShowAiChat && onShowAiChat()}>
                <MessageSquare className="h-4 w-4 mr-2" />
                开始AI对话
              </Button>
              <Button variant="outline" onClick={() => onShowSourceDocument && onShowSourceDocument()}>
                <Upload className="h-4 w-4 mr-2" />
                上传需求材料
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowPdfViewer(true)}>
                查看原始需求文档
              </Button>
              <Button variant="outline" size="sm" onClick={onShowPrototype}>
                查看产品原型
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSourceCodeEditor(true)}
                className="flex items-center gap-1"
              >
                <CodeIcon className="h-4 w-4" />
                <span>编辑源代码</span>
              </Button>
            </div>

            <TiptapEditor
              content={content}
              onUpdate={handleContentUpdate}
              onCitationClick={handleCitationClick}
              onPrototypeClick={handlePrototypeClick}
              onOutlineChange={setDocumentOutline}
              onVersionChange={handleVersionChange}
              versions={specVersions.map((v) => ({
                id: Number.parseInt(v.version),
                label: `版本 ${v.version}`,
                timestamp: formatRelativeTime(v.createdAt),
                contentLength: v.contentLength,
              }))}
              currentVersion={
                selectedVersion
                  ? Number.parseInt(selectedVersion)
                  : currentSpec
                    ? Number.parseInt(currentSpec.version)
                    : 0
              }
            />

            {showCitationArrow && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-50">
                <div className="relative">
                  <div className="absolute w-64 h-0 border-t-2 border-red-500 right-0" style={{ width: "200px" }}></div>
                  <div className="absolute right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    查看原始需求文档
                  </div>
                </div>
              </div>
            )}

            {showPrototypeArrow && (
              <div className="absolute right-0 top-1/3 transform -translate-y-1/2 z-50">
                <div className="relative">
                  <div
                    className="absolute w-64 h-0 border-t-2 border-green-500 right-0"
                    style={{ width: "200px" }}
                  ></div>
                  <div className="absolute right-0 w-4 h-4 border-t-2 border-r-2 border-green-500 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    查看产品原型
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAiAssistant && (
        <div className="absolute bottom-4 right-4 z-50">
          <AiAssistant onClose={() => setShowAiAssistant(false)} />
        </div>
      )}

      {showAiChat && (
        <div className="absolute bottom-4 right-4 z-50">
          <AiChatInterface onClose={() => setShowAiChat(false)} />
        </div>
      )}

      {showTextAnnotation && (
        <div className="absolute top-1/3 left-1/3 z-50">
          <TextAnnotation onClose={() => setShowTextAnnotation(false)} />
        </div>
      )}

      {showTextSelection && (
        <div className="absolute top-1/4 left-1/4 z-50">
          <TextSelection onClose={() => setShowTextSelection(false)} />
        </div>
      )}

      {showAiTextSelection && (
        <div className="absolute top-1/4 left-1/4 z-50">
          <AiTextSelection onClose={() => setShowAiTextSelection(false)} />
        </div>
      )}

      {showAiCapabilityMenu && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <AiCapabilityMenu />
        </div>
      )}

      {showAiEntryPoint && (
        <div className="absolute bottom-16 right-4 z-50">
          <AiEntryPoint onClose={() => setShowAiEntryPoint(false)} />
        </div>
      )}

      {showPdfViewer && (
        <div className="absolute inset-0 flex z-50">
          <div className="flex-1 overflow-hidden">
            <PdfViewer onClose={() => setShowPdfViewer(false)} />
          </div>
        </div>
      )}

      <Button
        className="absolute bottom-4 right-4 rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        onClick={() => (onShowAiChat ? onShowAiChat() : setShowAiChat(!showAiChat))}
        style={{ zIndex: showAiAssistant ? 0 : 40 }}
      >
        AI
      </Button>

      <div className="absolute bottom-20 right-4 flex flex-col gap-2" style={{ zIndex: 30 }}>
        <Button
          className="rounded-full h-10 w-10 bg-white border shadow-md"
          onClick={() => setShowTextAnnotation(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          className="rounded-full h-10 w-10 bg-white border shadow-md"
          onClick={() => (onShowAiChat ? onShowAiChat() : setShowAiChat(true))}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
      {showSourceCodeEditor && (
        <SourceCodeEditor
          content={content}
          onClose={() => setShowSourceCodeEditor(false)}
          onSave={(html) => {
            setContent(html)
            debouncedContentChange(html)
          }}
        />
      )}
    </div>
  )
}

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小时前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}天前`
}
