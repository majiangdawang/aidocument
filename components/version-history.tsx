"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"

interface Version {
  id: number
  timestamp: string
  content: string
}

interface VersionHistoryProps {
  versions: Version[]
  currentVersion: number
  onSelectVersion: (version: number) => void
}

export function VersionHistory({ versions, currentVersion, onSelectVersion }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button className="flex items-center gap-1 px-3 py-2 rounded border bg-white" onClick={() => setIsOpen(!isOpen)}>
        <span>v{currentVersion}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md border w-64 z-50">
          {versions.map((version) => (
            <button
              key={version.id}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => {
                onSelectVersion(version.id)
                setIsOpen(false)
              }}
            >
              <div>
                <div className="font-medium">Version {version.id}</div>
                <div className="text-gray-500 text-sm">{version.timestamp}</div>
              </div>
              {version.id === currentVersion && <Check className="h-5 w-5 text-black" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
