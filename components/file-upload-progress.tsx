"use client"

import { useState, useEffect } from "react"
import { Upload, CheckCircle } from "lucide-react"

interface FileUploadProgressProps {
  isVisible: boolean
}

export function FileUploadProgress({ isVisible }: FileUploadProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowComponent(true)
      setProgress(0)
      setIsComplete(false)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          if (newProgress >= 100) {
            clearInterval(interval)
            setIsComplete(true)
            return 100
          }
          return newProgress
        })
      }, 300)

      return () => clearInterval(interval)
    } else if (isComplete) {
      // Hide after completion with a delay
      const timeout = setTimeout(() => {
        setShowComponent(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isVisible, isComplete])

  if (!showComponent) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 w-64 border border-gray-200">
      <div className="flex items-center mb-2">
        {isComplete ? (
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <Upload className="h-5 w-5 text-blue-500 mr-2" />
        )}
        <span className="text-sm font-medium">{isComplete ? "文件上传完成" : "正在上传文件..."}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${isComplete ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
        {isComplete && <span className="text-xs text-green-500">完成</span>}
      </div>
    </div>
  )
}
