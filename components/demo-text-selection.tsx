"use client"

import { useState, useEffect } from "react"
import { TextSelectionTooltip } from "./text-selection-tooltip"
import { AiTextSelection } from "./ai-text-selection"

export function DemoTextSelection() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showAiAnalysis, setShowAiAnalysis] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
      })
      setShowTooltip(true)
    } else {
      setShowTooltip(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection)
    return () => {
      document.removeEventListener("mouseup", handleTextSelection)
    }
  }, [])

  return (
    <>
      {showTooltip && (
        <div className="absolute z-50" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
          <TextSelectionTooltip
            onClose={() => setShowTooltip(false)}
            onAiAnalysis={() => {
              setShowTooltip(false)
              setShowAiAnalysis(true)
            }}
          />
        </div>
      )}

      {showAiAnalysis && (
        <div className="fixed top-1/4 left-1/4 z-50">
          <AiTextSelection onClose={() => setShowAiAnalysis(false)} />
        </div>
      )}
    </>
  )
}
