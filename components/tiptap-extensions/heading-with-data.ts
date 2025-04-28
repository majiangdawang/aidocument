import Heading from "@tiptap/extension-heading"

export const HeadingWithData = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-section-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-section-id"),
        renderHTML: (attributes) => {
          if (!attributes["data-section-id"]) {
            return {}
          }

          return {
            "data-section-id": attributes["data-section-id"],
          }
        },
      },
    }
  },
})
