"use client"

import { useEffect, useRef } from "react"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import { useParams } from "next/navigation"

interface GlobalFileUploadProps {
  onUploadStart: () => void
  onUploadComplete: () => void
  disabled?: boolean
}

export function GlobalFileUpload({ onUploadStart, onUploadComplete, disabled = false }: GlobalFileUploadProps) {
  const { toast } = useToast()
  const params = useParams()
  const projectId = params.projectId as string
  const uploadingRef = useRef(false)

  // Handle file paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled || uploadingRef.current) return

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        e.preventDefault()
        const files = e.clipboardData.files
        await uploadFiles(files)
      }
    }

    // Handle global paste
    document.addEventListener("paste", handlePaste)

    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [disabled])

  // Handle file drag and drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (disabled || uploadingRef.current) return
      e.preventDefault()
    }

    const handleDrop = async (e: DragEvent) => {
      if (disabled || uploadingRef.current) return
      e.preventDefault()

      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const files = e.dataTransfer.files
        await uploadFiles(files)
      }
    }

    // Add global drag and drop handlers
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("drop", handleDrop)
    }
  }, [disabled])

  const uploadFiles = async (fileList: FileList) => {
    if (!projectId || uploadingRef.current) return

    uploadingRef.current = true
    onUploadStart()

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
        // 请求成功，使用返回的消息或构造默认消息
        const message = result.message || `成功上传 ${fileList.length} 个文件`
        toast({
          title: "上传成功",
          description: message,
        })
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
      uploadingRef.current = false
      onUploadComplete()
    }
  }

  // This component doesn't render anything visible
  return null
}
