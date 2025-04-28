"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, FileLineChartIcon as FlowChart, GitBranch, FileText, Send } from "lucide-react"
import { EditConfirmationDialog } from "./edit-confirmation-dialog"

interface EditOptionsDialogProps {
  onClose: () => void
  selectedText?: string
  startLine?: number
  endLine?: number
}

export function EditOptionsDialog({ onClose, selectedText = "", startLine = 1, endLine = 1 }: EditOptionsDialogProps) {
  const [inputValue, setInputValue] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [versions, setVersions] = useState([{ id: 0, timestamp: "Original", content: selectedText }])
  const [currentVersion, setCurrentVersion] = useState(0)

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue((prev) => {
      if (prev) {
        return `${prev} ${suggestion}`
      }
      return suggestion
    })
  }

  const handleSubmit = () => {
    // Show confirmation dialog and hide edit options dialog
    setShowConfirmation(true)
  }

  const handleAccept = () => {
    // Add a new version
    const newVersion = {
      id: versions.length,
      timestamp: new Date().toLocaleString(),
      content: generateCodeContent(),
    }

    setVersions([...versions, newVersion])
    setCurrentVersion(newVersion.id)

    // Close both dialogs
    setShowConfirmation(false)
    onClose()
  }

  const handleReject = () => {
    // Just close the confirmation dialog
    setShowConfirmation(false)
  }

  // Generate syntax-highlighted code based on the selected text and input
  const generateCodeContent = () => {
    // This is a placeholder - in a real implementation, you would generate
    // code based on the selected text and the user's input
    if (selectedText.includes("医嘱处理") || inputValue.includes("医嘱")) {
      return `<span style="color: purple;">print</span>(<span style="color: brown;">"、医嘱处理、定价结算等核心业"</span>)`
    } else if (selectedText.includes("for") || inputValue.includes("循环")) {
      return `<span style="color: purple;">for</span> <span style="color: blue;">_</span> <span style="color: purple;">in</span> <span style="color: purple;">range</span>(<span style="color: green;">100</span>):<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: purple;">print</span>(<span style="color: brown;">"Hello, World!"</span>)`
    } else {
      return `<span style="color: purple;">print</span>(<span style="color: brown;">"${selectedText || "Hello, World!"}"</span>)`
    }
  }

  return (
    <>
      {!showConfirmation && (
        <Card className="shadow-lg w-96 p-4 z-[9999] fixed edit-options-dialog">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">编辑选中内容</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedText && (
            <div className="mb-3 p-2 bg-gray-100 rounded-md text-sm">
              <p className="font-medium text-xs text-gray-500 mb-1">选中内容：</p>
              <p className="text-gray-700">
                {selectedText.length > 40
                  ? `${selectedText.substring(0, 20)}.....${selectedText.substring(selectedText.length - 20)}`
                  : selectedText}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                源代码第 {startLine} 行至第 {endLine} 行
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">您想对选中内容做什么？</p>
            <textarea
              className="w-full p-3 border rounded-md text-sm min-h-[100px]"
              placeholder="输入您的指令，或点击下方建议..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-xs text-gray-500">建议：</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("生成业务流程图")}
                className="text-xs"
              >
                <FlowChart className="h-3 w-3 mr-1" />
                生成业务流程图
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("创建思维导图")}
                className="text-xs"
              >
                <GitBranch className="h-3 w-3 mr-1" />
                创建思维导图
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("循环输出100次")}
                className="text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                循环输出100次
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" onClick={handleSubmit} className="flex items-center">
              <Send className="h-3 w-3 mr-1" />
              提交
            </Button>
          </div>
        </Card>
      )}

      {showConfirmation && (
        <EditConfirmationDialog
          title={inputValue || "123123"}
          onAccept={handleAccept}
          onReject={handleReject}
          code={generateCodeContent()}
        />
      )}
    </>
  )
}
