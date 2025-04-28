import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { PrototypeReferenceComponent } from "../prototype-reference-component"

export interface PrototypeReferenceOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    prototypeReference: {
      setPrototypeReference: (id: string) => ReturnType
    }
  }
}

export const PrototypeReference = Node.create<PrototypeReferenceOptions>({
  name: "prototypeReference",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: "default",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "span.prototype-reference",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "prototype-reference" }), "原型"]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PrototypeReferenceComponent)
  },

  addCommands() {
    return {
      setPrototypeReference:
        (id) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { id },
            })
            .run()
        },
    }
  },
})
