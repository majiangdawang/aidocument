"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import { useParams } from "next/navigation"
import {
  FileText,
  Upload,
  Loader2,
  MessageSquare,
  File,
  Trash2,
  FileImage,
  FileType,
  FileSpreadsheet,
} from "lucide-react"
import { DragDropArea } from "./drag-drop-area"

interface FileData {
  id: string
  name: string
  type: string
  size: number
  url: string
  createdAt: string
}

interface EmptyProjectStateProps {
  onStartCreatingDocument: (description: string) => void
  onFilesUploaded: () => void
}

export function EmptyProjectState({ onStartCreatingDocument, onFilesUploaded }: EmptyProjectStateProps) {
  const [description, setDescription] = useState("")
  const [step, setStep] = useState<"initial" | "document">("initial")
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<FileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const params = useParams()
  const projectId = params.projectId as string

  // Fetch files when component mounts
  useEffect(() => {
    if (projectId) {
      fetchFiles()
    } else {
      setIsLoading(false)
    }
  }, [projectId])

  // Fetch files from API
  const fetchFiles = async () => {
    if (!projectId) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/files/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      })

      const result = await response.json()

      if (response.ok) {
        // Handle different response structures
        const fileData = result.success ? result.data.files : result.data ? result.data.files : result.files

        if (Array.isArray(fileData)) {
          console.log("Files fetched successfully:", fileData)
          setFiles(fileData)
        } else {
          console.error("Invalid file data format:", fileData)
          toast({
            title: "获取文件列表失败",
            description: "返回的文件数据格式不正确",
            variant: "destructive",
          })
        }
      } else {
        console.error("获取文件列表失败:", result.message || "未知错误")
        toast({
          title: "获取文件列表失败",
          description: result.message || "未知错误",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("获取文件列表时出错:", err)
      toast({
        title: "获取文件列表失败",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStartCreatingDocument(description)
  }

  const handleAddButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Process uploaded files
  const processFiles = async (fileList: FileList) => {
    if (!projectId) {
      toast({
        title: "上传失败",
        description: "未找到项目ID",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const formData = new FormData()
      formData.append("projectId", projectId)

      Array.from(fileList).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Handle successful upload
        const message = result.message || `成功上传 ${fileList.length} 个文件`
        toast({
          title: "上传成功",
          description: message,
        })
        // Refresh file list
        fetchFiles()
        // Notify parent component
        onFilesUploaded()
      } else {
        // Handle failed upload
        console.error("上传文件失败:", result.message || "未知错误")
        toast({
          title: "上传失败",
          description: result.message || "未知错误",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("上传文件时出错:", err)
      toast({
        title: "上传失败",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(event.target.files)
      // Reset file input
      event.target.value = ""
    }
  }

  // Delete file
  const deleteFile = async (fileId: string) => {
    setIsDeleting(fileId)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        const message = result.message || result.data?.message || "文件已删除"
        toast({
          title: "删除成功",
          description: message,
        })
        // Remove file from local state
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
      } else {
        console.error("删除文件失败:", result.message || "未知错误")
        toast({
          title: "删除失败",
          description: result.message || "未知错误",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("删除文件时出错:", err)
      toast({
        title: "删除失败",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Get file icon based on file type
  const getFileIcon = (fileType: string, fileName: string) => {
    const type = fileType.toLowerCase()
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    // Image files
    if (type.includes("image") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <FileImage className="h-5 w-5 text-purple-500" />
    }

    // Document files
    if (type.includes("word") || type.includes("doc") || ["doc", "docx", "rtf"].includes(extension)) {
      return <FileText className="h-5 w-5 text-blue-500" />
    }

    // Spreadsheet files
    if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx", "csv"].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    }

    // PDF files
    if (type.includes("pdf") || extension === "pdf") {
      return <FileType className="h-5 w-5 text-red-500" />
    }

    // Default icon
    return <File className="h-5 w-5 text-gray-500" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (step === "document") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">开始创建需求规格说明书</h1>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              简要描述您的项目需求
            </label>
            <Textarea
              id="description"
              placeholder="例如：我需要一个电商网站，主要功能包括商品展示、购物车、支付和会员系统..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep("initial")}>
              上一步
            </Button>
            <Button type="submit" disabled={!description.trim()}>
              创建文档
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-8">开始您的项目</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">上传需求文档</h2>
          <p className="text-gray-500 mb-6">上传您已有的需求文档，可以是Word、PDF、Excel等多种格式</p>

          <DragDropArea onFilesDrop={processFiles} className="w-full mb-4" disabled={isUploading}>
            <div className="text-center py-4">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">正在上传文件...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">拖放文件到此处</p>
                  <p className="text-sm text-gray-500 mt-1">或</p>
                  <Button variant="ghost" className="mt-2" onClick={handleAddButtonClick}>
                    点击上传
                  </Button>
                </>
              )}
            </div>
          </DragDropArea>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".doc,.docx,.pdf,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.zip,.rar"
          />

          {/* Display uploaded files */}
          {files.length > 0 && (
            <div className="w-full mt-6 border-t pt-4">
              <h3 className="text-sm font-medium text-left mb-2">已上传文件 ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded group text-left">
                    {getFileIcon(file.type, file.name)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{file.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{formatFileSize(file.size)}</span>
                        {file.createdAt && (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{formatDate(file.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteFile(file.id)}
                      disabled={isDeleting === file.id}
                    >
                      {isDeleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              {files.length > 0 && (
                <div className="mt-4">
                  <Button onClick={() => onFilesUploaded()} className="w-full">
                    继续使用已上传文件
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">创建需求规格说明书</h2>
          <p className="text-gray-500 mb-6">从头开始创建需求规格说明书，您可以直接使用AI辅助完成</p>
          <Button onClick={() => setStep("document")} className="w-full">
            开始创建
          </Button>
          <div className="mt-4 w-full">
            <div className="text-center my-2">
              <span className="text-sm text-gray-500">或者</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onStartCreatingDocument("")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              通过AI对话输入需求
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
