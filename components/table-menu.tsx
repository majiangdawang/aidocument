"use client"

import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { RowsIcon, ColumnsIcon, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Merge, Split } from "lucide-react"

interface TableMenuProps {
  editor: Editor
  isTableSelected: boolean
}

export function TableMenu({ editor, isTableSelected }: TableMenuProps) {
  if (!isTableSelected) return null

  // 调试信息
  console.log("Table is selected, showing table menu")

  // 检查表格命令是否可用
  const canAddColumnBefore = editor.can().addColumnBefore()
  const canAddColumnAfter = editor.can().addColumnAfter()
  const canDeleteColumn = editor.can().deleteColumn()
  const canAddRowBefore = editor.can().addRowBefore()
  const canAddRowAfter = editor.can().addRowAfter()
  const canDeleteRow = editor.can().deleteRow()
  const canMergeCells = editor.can().mergeCells()
  const canSplitCell = editor.can().splitCell()
  const canDeleteTable = editor.can().deleteTable()

  console.log({
    canAddColumnBefore,
    canAddColumnAfter,
    canDeleteColumn,
    canAddRowBefore,
    canAddRowAfter,
    canDeleteRow,
    canMergeCells,
    canSplitCell,
    canDeleteTable,
  })

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white border rounded-md shadow-sm">
      <div className="flex gap-1 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Adding column before")
            editor.chain().focus().addColumnBefore().run()
          }}
          title="在前面添加列"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-1">前列</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Adding column after")
            editor.chain().focus().addColumnAfter().run()
          }}
          title="在后面添加列"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="ml-1">后列</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Deleting column")
            editor.chain().focus().deleteColumn().run()
          }}
          title="删除列"
        >
          <ColumnsIcon className="h-4 w-4" />
          <span className="ml-1">删列</span>
        </Button>
      </div>

      <div className="flex gap-1 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Adding row before")
            editor.chain().focus().addRowBefore().run()
          }}
          title="在上面添加行"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="ml-1">上行</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Adding row after")
            editor.chain().focus().addRowAfter().run()
          }}
          title="在下面添加行"
        >
          <ArrowDown className="h-4 w-4" />
          <span className="ml-1">下行</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Deleting row")
            editor.chain().focus().deleteRow().run()
          }}
          title="删除行"
        >
          <RowsIcon className="h-4 w-4" />
          <span className="ml-1">删行</span>
        </Button>
      </div>

      <div className="flex gap-1 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Merging cells")
            editor.chain().focus().mergeCells().run()
          }}
          title="合并单元格"
          disabled={!canMergeCells}
        >
          <Merge className="h-4 w-4" />
          <span className="ml-1">合并</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Splitting cell")
            editor.chain().focus().splitCell().run()
          }}
          title="拆分单元格"
          disabled={!canSplitCell}
        >
          <Split className="h-4 w-4" />
          <span className="ml-1">拆分</span>
        </Button>
      </div>

      <div className="flex gap-1 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Deleting table")
            editor.chain().focus().deleteTable().run()
          }}
          title="删除表格"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-1">删表格</span>
        </Button>
      </div>
    </div>
  )
}
