"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { API_BASE_URL } from "@/lib/config"
import {
  X,
  FileText,
  File,
  FileSpreadsheet,
  Plus,
  Search,
  Upload,
  MessageSquare,
  Trash2,
  Loader2,
  FileImage,
  FileAudio,
  FileVideo,
  FileArchive,
  FileType,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { DragDropArea } from "./drag-drop-area"
import { useToast } from "@/components/ui/use-toast"
import { useParams } from "next/navigation"

interface FileData {
  id: string
  name: string
  type: string
  size: number
  url: string
  createdAt: string
}

// Add a prop for forcing a refresh
interface FileAttachmentListProps {
  onClose: () => void
  isEmptyProject?: boolean
  onStartChat?: () => void
  forceRefresh?: boolean
}

// Update the function signature
export function FileAttachmentList({
  onClose,
  isEmptyProject = false,
  onStartChat,
  forceRefresh = false,
}: FileAttachmentListProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const params = useParams()
  const projectId = params.projectId as string

  console.log("Rendering FileAttachmentList with files:", files)

  // 获取文件列表
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
      console.log("API response:", result)

      if (response.ok) {
        // 处理新的响应结构
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

  // 组件加载时获取文件列表
  useEffect(() => {
    console.log("FileAttachmentList mounted with projectId:", projectId)
    if (projectId) {
      fetchFiles()
    } else {
      setIsLoading(false)
    }
  }, [projectId])

  // Add this effect to handle the forceRefresh prop
  useEffect(() => {
    if (forceRefresh && projectId) {
      fetchFiles()
    }
  }, [forceRefresh, projectId])

  // 上传文件
  const uploadFiles = async (fileList: FileList) => {
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
        // 处理新的响应结构
        const message = result.message || result.data?.message || `成功上传 ${fileList.length} 个文件`
        toast({
          title: "上传成功",
          description: message,
        })
        // 刷新文件列表
        fetchFiles()
      } else {
        // 请求失败，使用返回的错误消息或默认错误消息
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

  // 删除文件
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
        // 处理新的响应结构
        const message = result.message || result.data?.message || "文件已删除"
        toast({
          title: "删除成功",
          description: message,
        })
        // 立即从本地状态中移除文件以提供更好的用户体验
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
        // 然后刷新文件列表以确保同步
        fetchFiles()
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

  const processFiles = (fileList: FileList) => {
    uploadFiles(fileList)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(event.target.files)
      // 清空文件输入，以便可以再次选择相同的文件
      event.target.value = ""
    }
  }

  const handleAddButtonClick = () => {
    fileInputRef.current?.click()
  }

  // 获取文件图标
  const getFileIcon = (fileType: string, fileName: string) => {
    const type = fileType.toLowerCase()
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    // 图片文件
    if (type.includes("image") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <FileImage className="h-5 w-5 text-purple-500" />
    }

    // 文档文件
    if (type.includes("word") || type.includes("doc") || ["doc", "docx", "rtf"].includes(extension)) {
      return <FileText className="h-5 w-5 text-blue-500" />
    }

    // 表格文件
    if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx", "csv"].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    }

    // PDF文件
    if (type.includes("pdf") || extension === "pdf") {
      return <FileType className="h-5 w-5 text-red-500" />
    }

    // 音频文件
    if (type.includes("audio") || ["mp3", "wav", "ogg", "flac", "m4a"].includes(extension)) {
      return <FileAudio className="h-5 w-5 text-yellow-500" />
    }

    // 视频文件
    if (type.includes("video") || ["mp4", "avi", "mov", "wmv", "flv", "mkv"].includes(extension)) {
      return <FileVideo className="h-5 w-5 text-pink-500" />
    }

    // 压缩文件
    if (type.includes("zip") || type.includes("compressed") || ["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return <FileArchive className="h-5 w-5 text-amber-500" />
    }

    // 文本文件
    if (type.includes("text") || extension === "txt") {
      return <File className="h-5 w-5 text-gray-500" />
    }

    // 默认图标
    return <File className="h-5 w-5 text-gray-500" />
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // 格式化日期
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

  return (
    <div className="flex flex-col h-full border-l">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium">原始需求材料列表</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddButtonClick} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".doc,.docx,.pdf,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.zip,.rar"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {files.length > 0 ? (
              <DragDropArea onFilesDrop={processFiles} className="mb-4" disabled={isUploading}>
                <div className="text-center py-2">
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <p className="text-sm text-gray-500">正在上传文件...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">拖放文件到此处上传更多文件</p>
                  )}
                </div>
              </DragDropArea>
            ) : null}

            {files.length > 0 ? (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded group">
                    {getFileIcon(file.type, file.name)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{file.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{formatDate(file.createdAt)}</span>
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {isEmptyProject ? (
                  <>
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">上传需求材料</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs">
                      您可以上传任意类型的文档作为需求材料，包括Word、Excel、PDF等格式。
                    </p>
                    <div className="space-y-3 w-full">
                      <DragDropArea onFilesDrop={processFiles} className="mb-4" disabled={isUploading}>
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
                      <div className="text-center">
                        <span className="text-sm text-gray-500">或者</span>
                      </div>
                      <Button variant="outline" className="w-full" onClick={onStartChat}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        通过AI对话输入需求
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">没有需求材料</h3>
                    <p className="text-sm text-gray-500 mb-4">您还没有上传任何需求材料。</p>
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
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="p-2 border-t flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-xs">
            <Search className="h-3 w-3 mr-1" />
            搜索
          </Button>
        </div>
        <div className="text-xs text-gray-500">{files.length}个文件</div>
      </div>
    </div>
  )
}
