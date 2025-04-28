"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FileText, ChevronRight, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface File {
  id: string
  name: string
  type: string
  path: string
  icon: React.ReactNode
}

interface FileSelectionDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSelectFile: (file: File) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  position: { top: number; left: number }
}

export function FileSelectionDropdown({
  isOpen,
  onClose,
  onSelectFile,
  searchTerm,
  onSearchChange,
  position,
}: FileSelectionDropdownProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock files data - in a real app, this would come from your file system or API
  const files: File[] = [
    {
      id: "1",
      name: "dw03.jpg",
      type: "jpg",
      path: "/front/ew_design",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "2",
      name: "dw02.jpg",
      type: "jpg",
      path: "/front/ew_design",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "3",
      name: "dw01.jpg",
      type: "jpg",
      path: "/front/ew_design",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "4",
      name: "药品字典需求讨论会议记录.doc",
      type: "doc",
      path: "/documents",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "5",
      name: "药品字典原始数据分析会议.doc",
      type: "doc",
      path: "/documents",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    },
  ]

  // Filter files based on search term
  const filteredFiles = searchTerm
    ? files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : files

  // Recently added files (for demo purposes, just showing the first file)
  const recentlyAddedFiles = [files[0]]

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white border rounded-md shadow-lg w-80 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {/* Search input */}
      <div className="p-2 border-b flex items-center">
        <div className="flex items-center bg-gray-50 rounded-md border w-full p-1">
          <Search className="h-4 w-4 text-gray-400 ml-1" />
          <input
            type="text"
            className="bg-transparent border-none outline-none w-full px-2 py-1 text-sm"
            placeholder="Add files, folders, docs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSearchChange("")}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="max-h-60 overflow-y-auto">
        {filteredFiles.length > 0 ? (
          <div className="py-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => onSelectFile(file)}
              >
                {file.icon}
                <div className="ml-2 flex-1">
                  <div className="text-sm">{file.name}</div>
                  <div className="text-xs text-gray-400">{file.path}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-gray-500 text-sm">No files found</div>
        )}
      </div>

      {/* Recently added section */}
      {!searchTerm && recentlyAddedFiles.length > 0 && (
        <>
          <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50">Added</div>
          <div className="py-1">
            {recentlyAddedFiles.map((file) => (
              <div
                key={file.id}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => onSelectFile(file)}
              >
                {file.icon}
                <div className="ml-2 flex-1">
                  <div className="text-sm">{file.name}</div>
                  <div className="text-xs text-gray-400">{file.path}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Categories */}
      <div className="border-t">
        <div
          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          onClick={() => setActiveCategory(activeCategory === "files" ? null : "files")}
        >
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm">Files & folders</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <div
          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          onClick={() => setActiveCategory(activeCategory === "code" ? null : "code")}
        >
          <div className="flex items-center">
            <svg
              className="h-4 w-4 text-gray-400 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 18L22 12L16 6" />
              <path d="M8 6L2 12L8 18" />
            </svg>
            <span className="text-sm">Code</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <div
          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          onClick={() => setActiveCategory(activeCategory === "docs" ? null : "docs")}
        >
          <div className="flex items-center">
            <svg
              className="h-4 w-4 text-gray-400 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-sm">Docs</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
