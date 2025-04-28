"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { DocumentViewer } from "@/components/document-viewer"
import { Header } from "@/components/header"
import { FileAttachmentList } from "@/components/file-attachment-list"
import { ProductPrototype } from "@/components/product-prototype"
import { SourceDocument } from "@/components/source-document"
import { AiChatInterface } from "@/components/ai-chat-interface"
import { Loader2 } from "lucide-react"
import { GlobalFileUpload } from "@/components/global-file-upload"
import { FileUploadProgress } from "@/components/file-upload-progress"
import { EmptyProjectState } from "@/components/empty-project-state"
// Add the import for useRequirementSpec
import { useRequirementSpec } from "@/contexts/requirement-spec-context"

// Add the requirement spec state in the component
export default function ProjectPage() {
  const { user } = useAuth()
  const { projects, currentProject, selectProject, isLoading } = useProject()
  const { specsCount, currentSpec, createSpec, fetchSpecByVersion, specVersions } = useRequirementSpec()
  const [showFileList, setShowFileList] = useState(false)
  const [showPrototype, setShowPrototype] = useState(false)
  const [showSourceDocument, setShowSourceDocument] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [isEmptyProject, setIsEmptyProject] = useState(false)
  const [isGlobalUploading, setIsGlobalUploading] = useState(false)
  const [shouldRefreshFiles, setShouldRefreshFiles] = useState(false)
  const [projectDescription, setProjectDescription] = useState("")
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)
  const [documentContent, setDocumentContent] = useState(getInitialDocumentTemplate()) // Initialize with default content
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  // Update the useEffect to check for requirement specs
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (projects.length > 0 && projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        selectProject(projectId)

        // 检查是否为空项目（基于需求规格说明书数量）
        setIsEmptyProject(specsCount === 0)

        // 如果不是空项目，直接显示文档编辑器
        setShowDocumentEditor(specsCount > 0)
      } else {
        router.push("/projects")
      }
    }
  }, [user, projects, projectId, router, selectProject, specsCount])

  useEffect(() => {
    if (shouldRefreshFiles && showFileList) {
      setShouldRefreshFiles(false)
    }
  }, [shouldRefreshFiles, showFileList])

  // Update the handleStartCreatingDocument function to create a spec
  const handleStartCreatingDocument = async (description: string) => {
    setProjectDescription(description)
    setShowAiChat(true)
    setShowDocumentEditor(true)

    // 创建初始需求规格说明书
    if (currentProject && specsCount === 0) {
      try {
        await createSpec(currentProject.id, getInitialDocumentTemplate())
        setIsEmptyProject(false)
        setDocumentContent(getInitialDocumentTemplate()) // Update document content
      } catch (error) {
        console.error("创建初始需求规格说明书失败:", error)
      }
    }
  }

  // Handle creating a new spec when content is created for an empty project
  const handleEmptyProjectContentChange = async (content: string) => {
    if (currentProject && content && specsCount === 0) {
      try {
        await createSpec(currentProject.id, content)
        setIsEmptyProject(false)
        setDocumentContent(content) // Update document content
      } catch (error) {
        console.error("创建需求规格说明书失败:", error)
      }
    } else {
      setDocumentContent(content) // Update document content when not an empty project
    }
  }

  const [documentViewerKey, setDocumentViewerKey] = useState(0)

  useEffect(() => {
    setDocumentViewerKey((prevKey) => prevKey + 1)
  }, [currentSpec])

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">加载项目中...</p>
        </div>
      </div>
    )
  }

  // Add a useEffect to watch for specVersions changes and log them
  useEffect(() => {
    if (specVersions.length > 0) {
      console.log("Available versions:", specVersions)
    }
  }, [specVersions])

  // Update the DocumentViewer to use the current spec content
  return (
    <div className="flex flex-col h-screen">
      <Header
        projectName={currentProject.name}
        onShowFileList={() => {
          setShowFileList(true)
          setShowPrototype(false)
          setShowSourceDocument(false)
          setShowAiChat(false)
        }}
        onShowPrototype={() => {
          setShowPrototype(true)
          setShowFileList(false)
          setShowSourceDocument(false)
          setShowAiChat(false)
        }}
        onShowAiChat={() => {
          setShowAiChat(true)
          setShowFileList(false)
          setShowPrototype(false)
          setShowSourceDocument(false)
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        {isEmptyProject && !showDocumentEditor ? (
          <EmptyProjectState
            onStartCreatingDocument={handleStartCreatingDocument}
            onFilesUploaded={() => {
              setShowFileList(true)
              setShouldRefreshFiles(true)
            }}
          />
        ) : (
          <div className="flex-1 flex">
            <DocumentViewer
              key={documentViewerKey}
              isEmptyProject={isEmptyProject}
              onShowPrototype={() => {
                setShowPrototype(true)
                setShowFileList(false)
                setShowSourceDocument(false)
                setShowAiChat(false)
              }}
              onShowSourceDocument={() => {
                setShowSourceDocument(true)
                setShowFileList(false)
                setShowPrototype(false)
                setShowAiChat(false)
              }}
              onShowAiChat={() => {
                setShowAiChat(true)
                setShowFileList(false)
                setShowPrototype(false)
                setShowSourceDocument(false)
              }}
              initialContent={currentSpec ? currentSpec.content : ""} // 使用从API获取的内容
              onContentChange={handleEmptyProjectContentChange}
            />
            {showFileList && (
              <div className="w-80">
                <FileAttachmentList
                  onClose={() => setShowFileList(false)}
                  isEmptyProject={isEmptyProject}
                  onStartChat={() => {
                    setShowAiChat(true)
                    setShowFileList(false)
                  }}
                  forceRefresh={shouldRefreshFiles}
                />
              </div>
            )}
            {showPrototype && (
              <div className="w-[500px]">
                <ProductPrototype onClose={() => setShowPrototype(false)} />
              </div>
            )}
            {showSourceDocument && (
              <div className="w-[500px]">
                <SourceDocument onClose={() => setShowSourceDocument(false)} />
              </div>
            )}
            {showAiChat && (
              <div className="w-[400px]">
                <AiChatInterface
                  onClose={() => setShowAiChat(false)}
                  isEmptyProject={isEmptyProject}
                  initialMessage={projectDescription}
                  onGenerateDocument={() => {
                    setShowAiChat(false)
                    // 这里可以添加生成文档的逻辑
                    alert("正在生成需求规格说明书，请稍候...")
                    // 模拟生成过程
                    setTimeout(() => {
                      alert("需求规格说明书已生成！")
                    }, 2000)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <GlobalFileUpload
        onUploadStart={() => setIsGlobalUploading(true)}
        onUploadComplete={() => {
          setIsGlobalUploading(false)
          setShouldRefreshFiles(true)

          // If file list isn't open, show it
          if (!showFileList) {
            setShowFileList(true)
            setShowPrototype(false)
            setShowSourceDocument(false)
            setShowAiChat(false)
          }
        }}
        disabled={!user || !projectId}
      />
      <FileUploadProgress isVisible={isGlobalUploading} />
    </div>
  )
}

// 添加一个函数来生成初始文档模板
function getInitialDocumentTemplate() {
  return `
    <h1 data-section-id="heading-1">需求规格说明书</h1>
    <p>本文档描述了项目的需求规格。</p>
    
    <h2 data-section-id="heading-2">1. 引言</h2>
    <h3 data-section-id="heading-3">1.1 目的</h3>
    <p>本文档旨在详细描述系统的功能需求和非功能需求，为开发团队提供明确的开发指导。</p>
    
    <h3 data-section-id="heading-4">1.2 项目背景</h3>
    <p>描述项目的背景和上下文。</p>
    
    <h3 data-section-id="heading-5">1.3 定义和缩略语</h3>
    <p>列出文档中使用的专业术语和缩略语的定义。</p>
    
    <h2 data-section-id="heading-6">2. 系统概述</h2>
    <h3 data-section-id="heading-7">2.1 系统描述</h3>
    <p>概述系统的主要功能和目标。</p>
    
    <h3 data-section-id="heading-8">2.2 用户角色</h3>
    <p>描述系统的不同用户角色及其职责。</p>
    
    <h2 data-section-id="heading-9">3. 功能需求</h2>
    <h3 data-section-id="heading-10">3.1 核心功能</h3>
    <p>详细描述系统的核心功能需求。</p>
    
    <h3 data-section-id="heading-11">3.2 用户界面需求</h3>
    <p>描述用户界面的设计要求和交互方式。</p>
    
    <h2 data-section-id="heading-12">4. 非功能需求</h2>
    <h3 data-section-id="heading-13">4.1 性能需求</h3>
    <p>描述系统的性能要求，如响应时间、并发用户数等。</p>
    
    <h3 data-section-id="heading-14">4.2 安全需求</h3>
    <p>描述系统的安全要求，如数据加密、用户认证等。</p>
    
    <h3 data-section-id="heading-15">4.3 可靠性需求</h3>
    <p>描述系统的可靠性要求，如系统稳定性、容错能力等。</p>
    
    <h2 data-section-id="heading-16">5. 系统接口</h2>
    <h3 data-section-id="heading-17">5.1 用户接口</h3>
    <p>描述系统的用户接口设计。</p>
    
    <h3 data-section-id="heading-18">5.2 外部接口</h3>
    <p>描述系统与外部系统的接口设计。</p>
    
    <h2 data-section-id="heading-19">6. 数据需求</h2>
    <h3 data-section-id="heading-20">6.1 数据模型</h3>
    <p>描述系统的数据模型设计。</p>
    
    <h3 data-section-id="heading-21">6.2 数据字典</h3>
    <p>提供系统使用的数据字典。</p>
    
    <h2 data-section-id="heading-22">7. 约束条件</h2>
    <p>描述系统开发和运行的约束条件。</p>
    
    <h2 data-section-id="heading-23">8. 附录</h2>
    <p>提供补充信息和参考资料。</p>
  `
}
