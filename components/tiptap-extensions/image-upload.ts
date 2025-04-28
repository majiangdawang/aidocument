import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageUploadComponent } from "../image-upload-component"

export interface ImageUploadOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUpload: () => ReturnType
    }
  }
}

export const ImageUpload = Node.create<ImageUploadOptions>({
  name: "imageUpload",

  group: "block",

  // This is a leaf node - it doesn't have content
  atom: true,

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "div[data-type=image-upload]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // For a leaf node, we don't include a content placeholder (the "0")
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "image-upload" })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadComponent)
  },

  addCommands() {
    return {
      setImageUpload:
        () =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name }).run()
        },
    }
  },
})
