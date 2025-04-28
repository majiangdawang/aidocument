"use client"

import type React from "react"

import { NodeViewWrapper } from "@tiptap/react"
import { useState, useRef } from "react"
import { Upload } from "lucide-react"

export const ImageUploadComponent = ({ editor, node, getPos }: any) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        handleImageUpload(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type.startsWith("image/")) {
        handleImageUpload(file)
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      // In a real application, you would upload the file to your server or a storage service
      // For this example, we'll create a local object URL
      const imageUrl = URL.createObjectURL(file)

      // Get the position of the current node
      const pos = typeof getPos === "function" ? getPos() : undefined

      if (pos === undefined || !editor) {
        console.error("Cannot determine node position")
        return
      }

      // Replace the upload component with an actual image
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContent({
          type: "image",
          attrs: {
            src: imageUrl,
            alt: file.name,
          },
        })
        .run()
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <NodeViewWrapper>
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors my-4 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        contentEditable={false}
      >
        <div className="w-20 h-20 mb-4 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4 text-center">Drag and drop or</p>
        <button
          onClick={handleButtonClick}
          className="bg-black text-white px-6 py-2 rounded-md flex items-center"
          type="button"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload an image
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*" className="hidden" />
      </div>
    </NodeViewWrapper>
  )
}
