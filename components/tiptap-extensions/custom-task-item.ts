import { mergeAttributes } from "@tiptap/core"
import TaskItem from "@tiptap/extension-task-item"

export const CustomTaskItem = TaskItem.extend({
  content: "paragraph+",

  renderHTML({ HTMLAttributes }) {
    const { checked, ...otherAttributes } = HTMLAttributes

    return [
      "li",
      mergeAttributes(this.options.HTMLAttributes, otherAttributes),
      [
        "label",
        [
          "input",
          {
            type: "checkbox",
            checked: checked ? "checked" : null,
          },
        ],
      ],
      ["div", {}, 0], // This wrapper helps with cursor placement
    ]
  },
})
