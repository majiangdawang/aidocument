import Heading from "@tiptap/extension-heading"

export const HeadingWithID = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }

          return {
            id: attributes.id,
          }
        },
      },
    }
  },
})
