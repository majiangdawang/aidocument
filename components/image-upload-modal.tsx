"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ImageUpload } from "./image-upload"

interface ImageUploadModalProps {
  onClose: () => void
  onImageUploaded: (url: string) => void
}

export function ImageUploadModal({ onClose, onImageUploaded }: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageSelected = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // In a real application, you would upload the file to your server or a storage service
      // For this example, we'll create a local object URL
      const imageUrl = URL.createObjectURL(file)

      // Simulate a network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onImageUploaded(imageUrl)
      onClose()
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Upload Image</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <ImageUpload onImageSelected={handleImageSelected} />

          {uploadError && <div className="mt-4 text-red-500 text-sm">{uploadError}</div>}

          {isUploading && (
            <div className="mt-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
