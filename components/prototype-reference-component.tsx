"use client"
import { NodeViewWrapper } from "@tiptap/react"
import { Layers } from "lucide-react"

export const PrototypeReferenceComponent = (props: any) => {
  const { node } = props
  const id = node.attrs.id || "default"

  return (
    <NodeViewWrapper as="span">
      <span
        className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-green-500 text-white text-xs font-medium cursor-pointer ml-1"
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation()
          // Dispatch a custom event that we can listen for in the parent component
          const event = new CustomEvent("prototype-click", {
            detail: { id },
            bubbles: true,
          })
          e.currentTarget.dispatchEvent(event)
        }}
      >
        <Layers className="h-3 w-3 mr-1" />
        原型
      </span>
    </NodeViewWrapper>
  )
}
