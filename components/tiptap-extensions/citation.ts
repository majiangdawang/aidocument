import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { CitationComponent } from "../citation-component"

export interface CitationOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    citation: {
      setCitation: (number: string) => ReturnType
    }
  }
}

export const Citation = Node.create<CitationOptions>({
  name: "citation",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      number: {
        default: "1",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "span.citation-component",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "citation-component" }), HTMLAttributes.number]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CitationComponent)
  },

  addCommands() {
    return {
      setCitation:
        (number) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { number },
            })
            .run()
        },
    }
  },
})
