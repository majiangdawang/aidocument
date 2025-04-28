"use client"
import { NodeViewWrapper } from "@tiptap/react"

export const CitationComponent = (props: any) => {
  const { node } = props
  const number = node.attrs.number || "1"

  return (
    <NodeViewWrapper as="span">
      <span
        className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium cursor-pointer"
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation()
          // Dispatch a custom event that we can listen for in the parent component
          const event = new CustomEvent("citation-click", {
            detail: { number },
            bubbles: true,
          })
          e.currentTarget.dispatchEvent(event)
        }}
      >
        {number}
      </span>
    </NodeViewWrapper>
  )
}
