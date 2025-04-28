import { Node, mergeAttributes } from "@tiptap/core"

export interface ClarificationParagraphOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    clarificationParagraph: {
      setClarificationParagraph: () => ReturnType
      unsetClarificationParagraph: () => ReturnType
    }
  }
}

export const ClarificationParagraph = Node.create<ClarificationParagraphOptions>({
  name: "clarificationParagraph",

  group: "block",

  content: "inline*",

  defining: true,

  addAttributes() {
    return {
      class: {
        default: "clarification-paragraph",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "p.clarification-paragraph",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { class: "clarification-paragraph" }), 0]
  },

  addCommands() {
    return {
      setClarificationParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
      unsetClarificationParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode("paragraph")
        },
    }
  },
})
