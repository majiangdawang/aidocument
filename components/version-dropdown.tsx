"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check, Clock } from "lucide-react"

interface Version {
  id: number | string
  label: string
  timestamp: string
  contentLength?: number
}

interface VersionDropdownProps {
  currentVersion: number
  onVersionChange?: (version: number) => void
  versions?: Version[]
}

export function VersionDropdown({ currentVersion, onVersionChange, versions = [] }: VersionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Use provided versions or fallback to mock data if empty
  const displayVersions =
    versions.length > 0
      ? versions
      : [
          { id: 87, label: "Version 87", timestamp: "34 minutes ago" },
          { id: 86, label: "Version 86", timestamp: "1 hour ago" },
          { id: 85, label: "Version 85", timestamp: "5 hours ago" },
          { id: 84, label: "Version 84", timestamp: "21 hours ago" },
          { id: 83, label: "Version 83", timestamp: "22 hours ago" },
        ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-3 py-1 rounded-md border bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <span>v{currentVersion}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md border w-64 z-50 max-h-80 overflow-auto">
          <div className="p-2 border-b">
            <h3 className="text-sm font-medium">版本历史</h3>
          </div>
          {displayVersions.map((version) => (
            <button
              key={version.id}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              onClick={() => {
                if (onVersionChange) {
                  onVersionChange(typeof version.id === "string" ? Number.parseInt(version.id) : version.id)
                }
                setIsOpen(false)
              }}
            >
              <div>
                <div className="font-medium flex items-center gap-1">
                  {version.label}
                  {version.contentLength && (
                    <span className="text-xs text-gray-500">({formatFileSize(version.contentLength)})</span>
                  )}
                </div>
                <div className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {version.timestamp}
                </div>
              </div>
              {version.id === currentVersion && <Check className="h-5 w-5 text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB"
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }
}
