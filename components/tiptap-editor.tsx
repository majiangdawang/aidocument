"use client"

import type React from "react"
import { createPortal } from "react-dom"

import { useEditor, EditorContent, type Editor, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Undo,
  Redo,
  Plus,
  Type,
  ListChecks,
  Quote,
  Code,
  ImageIcon,
  TableIcon,
  FileText,
  Layers,
  HelpCircle,
  UnderlineIcon,
  SuperscriptIcon,
  SubscriptIcon,
  LinkIcon,
  Minus,
  ListTodo,
  Eraser,
  Paintbrush,
  StrikethroughIcon,
  Palette,
  Copy,
  Edit,
} from "lucide-react"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import TaskList from "@tiptap/extension-task-list"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Link from "@tiptap/extension-link"
import Dropcursor from "@tiptap/extension-dropcursor"
import CharacterCount from "@tiptap/extension-character-count"
import CodeBlock from "@tiptap/extension-code-block"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight, common } from "lowlight"

// 创建lowlight实例
const lowlight = createLowlight(common)
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TextStyle from "@tiptap/extension-text-style"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import Focus from "@tiptap/extension-focus"
import Image from "@tiptap/extension-image"
import Strike from "@tiptap/extension-strike"

// 导入表格相关扩展
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"

// 导入协作相关扩展（需要Yjs支持）
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import * as Y from "yjs"

// 导入自定义扩展
import { Citation } from "./tiptap-extensions/citation"
import { PrototypeReference } from "./tiptap-extensions/prototype-reference"
import { HeadingWithData } from "./tiptap-extensions/heading-with-data"
import { ClarificationParagraph } from "./tiptap-extensions/clarification-paragraph"
import { RequirementClarificationDialog } from "./requirement-clarification-dialog"
import { TableMenu } from "./table-menu"
import { ImageUpload } from "./tiptap-extensions/image-upload"
import { CustomTaskItem } from "./tiptap-extensions/custom-task-item"
import { EditOptionsDialog } from "./edit-options-dialog"

// Import the SourceCodeEditor component at the top of the file
import { SourceCodeEditor } from "./source-code-editor"
import { CodeIcon } from "lucide-react"
import { VersionDropdown } from "./version-dropdown"

// 在文件顶部添加 OutlineItem 接口定义
export interface OutlineItem {
  id: string
  title: string
  level: number
  children: OutlineItem[]
}

// 在 TiptapEditorProps 接口中添加一个新的回调函数属性
export interface TiptapEditorProps {
  content: string
  editable?: boolean
  onUpdate?: (html: string) => void
  onCitationClick?: () => void
  onPrototypeClick?: (id: string) => void
  onOutlineChange?: (outline: OutlineItem[]) => void // 添加这一行
  versions?: Array<{ id: number; label: string; timestamp: string; contentLength?: number }>
  currentVersion?: number
  onVersionChange?: (version: number) => void
}

interface CommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (editor: Editor) => void
}

// 格式刷状态
interface FormatPainterState {
  active: boolean
  marks: any
}

// 将 extractOutline 定义为组件外部的普通函数
function extractOutline(editor: Editor | null): OutlineItem[] {
  if (!editor) return []

  const outline: OutlineItem[] = []
  const stack: OutlineItem[] = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      const id = node.attrs["data-section-id"] || `heading-${pos}`
      const level = node.attrs.level
      const title = node.textContent

      const item: OutlineItem = {
        id,
        title,
        level,
        children: [],
      }

      // 找到当前标题应该放在哪个层级
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        outline.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }

      stack.push(item)
    }
    return true
  })

  return outline
}

// 颜色选择器组件
const ColorPicker = ({
  colors,
  onSelect,
  isOpen,
  onClose,
  title,
}: {
  colors: string[]
  onSelect: (color: string) => void
  isOpen: boolean
  onClose: () => void
  title?: string
}) => {
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false)
  const [customColor, setCustomColor] = useState("#000000")
  const [saturationPosition, setSaturationPosition] = useState({ x: 50, y: 50 })
  const [huePosition, setHuePosition] = useState({ x: 50 })

  // 将所有hooks移到组件顶层
  const saturationRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let r = 0,
      g = 0,
      b = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      b = 0
    } else if (h >= 60 && h < 120) {
      r = x
      g = c
      b = 0
    } else if (h >= 120 && h < 180) {
      r = 0
      g = c
      b = x
    } else if (h >= 180 && h < 240) {
      r = 0
      g = x
      b = c
    } else if (h >= 240 && h < 300) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  // Calculate color from positions
  const calculateColor = useCallback(() => {
    const hue = huePosition.x * 3.6 // 0-100 to 0-360
    const saturation = saturationPosition.x / 100 // 0-100 to 0-1
    const value = 1 - saturationPosition.y / 100 // 0-100 to 1-0 (inverted)

    const { r, g, b } = hsvToRgb(hue, saturation, value)
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }, [saturationPosition, huePosition])

  // Handle saturation area click
  const handleSaturationClick = useCallback((e: React.MouseEvent) => {
    if (!saturationRef.current) return

    const rect = saturationRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    setSaturationPosition({ x, y })
  }, [])

  // Handle hue slider click
  const handleHueClick = useCallback((e: React.MouseEvent) => {
    if (!hueRef.current) return

    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))

    setHuePosition({ x })
  }, [])

  // Update color when positions change
  useEffect(() => {
    if (showAdvancedPicker) {
      setCustomColor(calculateColor())
    }
  }, [saturationPosition, huePosition, calculateColor, showAdvancedPicker])

  if (!isOpen) return null

  // 渲染高级颜色选择器
  if (showAdvancedPicker) {
    return (
      <div className="absolute z-50 mt-1 bg-white rounded-md shadow-lg border p-2 w-64">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-medium text-gray-500">{title || "选择颜色"}</div>
          <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setShowAdvancedPicker(false)}>
            返回
          </button>
        </div>

        {/* Color gradient picker */}
        <div
          ref={saturationRef}
          className="w-full h-40 mb-2 rounded-md relative cursor-pointer"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%), 
                        linear-gradient(to right, rgba(128,128,128,1) 0%, 
                        hsl(${huePosition.x * 3.6}, 100%, 50%) 100%)`,
          }}
          onClick={handleSaturationClick}
        >
          {/* Color selector circle */}
          <div
            className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${saturationPosition.y}%`,
              left: `${saturationPosition.x}%`,
              backgroundColor: customColor,
            }}
          />
        </div>

        {/* Hue slider */}
        <div
          ref={hueRef}
          className="w-full h-8 mb-3 rounded-md relative cursor-pointer color-picker-hue"
          onClick={handleHueClick}
        >
          {/* Hue selector circle */}
          <div
            className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: "50%",
              left: `${huePosition.x}%`,
              backgroundColor: `hsl(${huePosition.x * 3.6}, 100%, 50%)`,
            }}
          />
        </div>

        {/* Hex input */}
        <input
          type="text"
          className="w-full p-2 border rounded-md text-sm mb-2"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300" onClick={onClose}>
            取消
          </button>
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => {
              onSelect(customColor)
              onClose()
            }}
          >
            确定
          </button>
        </div>
      </div>
    )
  }

  // 渲染简单颜色选择器
  // Group colors into rows of 5 for better organization
  const colorRows = []
  for (let i = 0; i < colors.length; i += 5) {
    colorRows.push(colors.slice(i, i + 5))
  }

  return (
    <div className="absolute z-50 mt-1 bg-white rounded-md shadow-lg border p-2 w-64">
      {title && <div className="text-xs font-medium mb-2 text-gray-500">{title}</div>}
      <div className="space-y-2">
        {colorRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-between">
            {row.map((color) => (
              <button
                key={color}
                className="w-10 h-10 rounded-md border hover:scale-110 transition-transform relative"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onSelect(color)
                  onClose()
                }}
                title={color}
              >
                {color === "transparent" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t">
        <button
          className="text-xs text-blue-500 hover:underline w-full text-center"
          onClick={() => setShowAdvancedPicker(true)}
        >
          Custom color...
        </button>
      </div>
    </div>
  )
}

// Define FloatingMenuButton component outside of the main component
const FloatingMenuButton = ({
  position,
  onClick,
}: {
  position: { top: number; left: number }
  onClick: (e: React.MouseEvent) => void
}) => {
  return (
    <div
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        pointerEvents: "auto",
      }}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full shadow-md bg-white"
        onClick={onClick}
        onMouseDown={(e) => {
          // Prevent the editor from handling the mousedown event
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const SlashCommandList = ({
  editor,
  items,
  onClose,
}: {
  editor: Editor
  items: CommandItem[]
  onClose: () => void
}) => {
  return (
    <div className="bg-white rounded-md shadow-lg border p-1 w-60">
      <div className="max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={index}
            className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 rounded"
            onClick={() => {
              item.command(editor)
              onClose()
            }}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
              {item.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const MenuBar = ({
  editor,
  onCitationClick,
  onPrototypeClick,
  onClarificationClick,
  setShowSourceCodeEditor,
  formatPainterState,
  setFormatPainterState,
  // Add these new props
  showTextColorPicker,
  setShowTextColorPicker,
  showHighlightColorPicker,
  setShowHighlightColorPicker,
  textColorRef,
  highlightColorRef,
  textColors,
  highlightColors,
}: {
  editor: Editor | null
  onCitationClick?: () => void
  onPrototypeClick?: (id: string) => void
  onClarificationClick?: () => void
  setShowSourceCodeEditor: (show: boolean) => void
  formatPainterState: FormatPainterState
  setFormatPainterState: React.Dispatch<React.SetStateAction<FormatPainterState>>
  // Add these new prop types
  showTextColorPicker: boolean
  setShowTextColorPicker: React.Dispatch<React.SetStateAction<boolean>>
  showHighlightColorPicker: boolean
  setShowHighlightColorPicker: React.Dispatch<React.SetStateAction<boolean>>
  textColorRef: React.RefObject<HTMLDivElement>
  highlightColorRef: React.RefObject<HTMLDivElement>
  textColors: string[]
  highlightColors: string[]
}) => {
  // Remove these declarations since they're now passed as props
  // const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  // const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false)
  // textColorRef = useRef<HTMLDivElement>(null)
  // highlightColorRef = useRef<HTMLDivElement>(null)

  // Remove the textColors and highlightColors arrays since they're now passed as props

  // Remove the useEffect for click outside since it's now in the parent component

  const [showTextColorPickerLocal, setShowTextColorPickerLocal] = useState(false)
  const [showHighlightColorPickerLocal, setShowHighlightColorPickerLocal] = useState(false)
  const textColorRefLocal = useRef<HTMLDivElement>(null)
  const highlightColorRefLocal = useRef<HTMLDivElement>(null)

  // 预定义颜色
  const textColorsLocal = [
    "#000000", // Black
    "#5c5c5c", // Dark Gray
    "#737373", // Gray
    "#a6a6a6", // Light Gray
    "#ffffff", // White
    "#ff0000", // Red
    "#ff4d00", // Orange-Red
    "#ff9900", // Orange
    "#ffcc00", // Amber
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#00ffcc", // Teal
    "#00ccff", // Light Blue
    "#0066ff", // Blue
    "#3300ff", // Indigo
    "#9900ff", // Purple
    "#ff00ff", // Magenta
    "#990000", // Dark Red
    "#004d99", // Dark Blue
    "transparent", // No Color
  ]

  const highlightColorsLocal = [
    "#ffff00", // Yellow
    "#ffff8d", // Light Yellow
    "#fff59d", // Pale Yellow
    "#fffde7", // Very Pale Yellow
    "#fff8e1", // Cream
    "#ffcc80", // Light Orange
    "#ffab91", // Light Coral
    "#ffcdd2", // Light Pink
    "#f8bbd0", // Pink
    "#e1bee7", // Light Purple
    "#d1c4e9", // Lavender
    "#c5cae9", // Light Blue-Gray
    "#bbdefb", // Light Blue
    "#b3e5fc", // Sky Blue
    "#b2ebf2", // Light Cyan
    "#b2dfdb", // Light Teal
    "#c8e6c9", // Light Green
    "#dcedc8", // Pale Green
    "#f0f4c3", // Pale Lime
    "transparent", // No Highlight
  ]

  // 关闭颜色选择器的点击外部处理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textColorRefLocal.current && !textColorRefLocal.current.contains(event.target as Node)) {
        setShowTextColorPickerLocal(false)
      }
      if (highlightColorRefLocal.current && !highlightColorRefLocal.current.contains(event.target as Node)) {
        setShowHighlightColorPickerLocal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!editor) {
    return null
  }

  const handleInsertTable = () => {
    console.log("Inserting table")
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  // 清除格式
  const handleClearFormat = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run()
  }

  // 格式刷
  const handleFormatPainter = () => {
    if (!formatPainterState.active) {
      // 获取当前选中文本的格式
      const marks = editor.view.state.selection.$head.marks()
      setFormatPainterState({
        active: true,
        marks: marks.length > 0 ? marks : null,
      })
    } else {
      // 关闭格式刷
      setFormatPainterState({
        active: false,
        marks: null,
      })
    }
  }

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-white sticky top-0 z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-gray-200" : ""}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-gray-200" : ""}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-gray-200" : ""}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-gray-200" : ""}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Button>

      {/* 字颜色 */}
      <div className="relative" ref={textColorRefLocal}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTextColorPickerLocal(!showTextColorPickerLocal)}
          className={editor.isActive("textStyle") ? "bg-gray-200" : ""}
          title="文字颜色"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <ColorPicker
          colors={textColorsLocal}
          onSelect={(color) => editor.chain().focus().setColor(color).run()}
          isOpen={showTextColorPickerLocal}
          onClose={() => setShowTextColorPickerLocal(false)}
          title="文字颜色"
        />
      </div>

      {/* 高亮颜色 */}
      <div className="relative" ref={highlightColorRefLocal}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHighlightColorPickerLocal(!showHighlightColorPickerLocal)}
          className={editor.isActive("highlight") ? "bg-gray-200" : ""}
          title="高亮颜色"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <ColorPicker
          colors={highlightColorsLocal}
          onSelect={(color) => {
            if (color === "transparent") {
              editor.chain().focus().unsetHighlight().run()
            } else {
              editor.chain().focus().toggleHighlight({ color }).run()
            }
          }}
          isOpen={showHighlightColorPickerLocal}
          onClose={() => setShowHighlightColorPickerLocal(false)}
          title="高亮颜色"
        />
      </div>

      {/* 清除格式 */}
      <Button variant="ghost" size="sm" onClick={handleClearFormat} title="清除格式">
        <Eraser className="h-4 w-4" />
      </Button>

      {/* 格式刷 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFormatPainter}
        className={formatPainterState.active ? "bg-gray-200" : ""}
        title="格式刷"
      >
        <Paintbrush className="h-4 w-4" />
      </Button>

      <div className="h-6 border-l mx-1"></div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={editor.isActive("taskList") ? "bg-gray-200" : ""}
      >
        <ListTodo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={editor.isActive("superscript") ? "bg-gray-200" : ""}
      >
        <SuperscriptIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={editor.isActive("subscript") ? "bg-gray-200" : ""}
      >
        <SubscriptIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("URL")
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          } else {
            editor.chain().focus().unsetLink().run()
          }
        }}
        className={editor.isActive("link") ? "bg-gray-200" : ""}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (editor.isActive("clarificationParagraph")) {
            editor.chain().focus().unsetClarificationParagraph().run()
          } else {
            editor.chain().focus().setClarificationParagraph().run()
          }
        }}
        className={editor.isActive("clarificationParagraph") ? "bg-gray-200" : ""}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.chain().focus().setImageUpload().run()
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleInsertTable}>
        <TableIcon className="h-4 w-4" />
      </Button>
      <div className="ml-auto flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Insert the prototype reference at the current cursor position
            if (editor) {
              editor.chain().focus().setPrototypeReference("default").run()
            }
          }}
        >
          <div className="inline-flex items-center justify-center px-2 h-8 rounded-md bg-green-500 text-white text-xs">
            <Layers className="h-3 w-3 mr-1" />
            原型
          </div>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Insert the citation at the current cursor position
            if (editor) {
              editor.chain().focus().setCitation("1").run()
            }
          }}
        >
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-base font-medium">
            1
          </div>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowSourceCodeEditor(true)} title="编辑源代码">
          <CodeIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">源代码</span>
        </Button>
      </div>
    </div>
  )
}

export function TiptapEditor({
  content,
  editable = true,
  onUpdate,
  onCitationClick,
  onPrototypeClick,
  onOutlineChange,
  versions,
  currentVersion,
  onVersionChange,
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [showSlashCommands, setShowSlashCommands] = useState(false)
  const [slashCommandPosition, setSlashCommandPosition] = useState({ top: 0, left: 0 })
  const [showClarificationDialog, setShowClarificationDialog] = useState(false)
  const [clarificationPosition, setClarificationPosition] = useState({ top: 0, left: 0 })
  const [clarificationText, setClarificationText] = useState("")
  const [isTableSelected, setIsTableSelected] = useState(false)
  const [showSourceCodeEditor, setShowSourceCodeEditor] = useState(false)
  const [showEditOptions, setShowEditOptions] = useState(false)
  const [editOptionsPosition, setEditOptionsPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState("")

  // Also add these state variables near the other state declarations:
  const [startLine, setStartLine] = useState(1)
  const [endLine, setEndLine] = useState(1)

  // Add this near the top of the component, with the other state variables
  // const [currentVersion, setCurrentVersion] = useState(87)
  const [documentVersions, setDocumentVersions] = useState([
    { id: 87, content: content, timestamp: "34 minutes ago" },
    { id: 86, content: content, timestamp: "1 hour ago" },
    { id: 85, content: content, timestamp: "5 hours ago" },
    { id: 84, content: content, timestamp: "21 hours ago" },
    { id: 83, content: content, timestamp: "22 hours ago" },
  ])

  // Color picker states
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false)
  const textColorRef = useRef<HTMLDivElement>(null)
  const highlightColorRef = useRef<HTMLDivElement>(null)

  // 预定义颜色
  const textColors = [
    "#000000", // Black
    "#5c5c5c", // Dark Gray
    "#737373", // Gray
    "#a6a6a6", // Light Gray
    "#ffffff", // White
    "#ff0000", // Red
    "#ff4d00", // Orange-Red
    "#ff9900", // Orange
    "#ffcc00", // Amber
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#00ffcc", // Teal
    "#00ccff", // Light Blue
    "#0066ff", // Blue
    "#3300ff", // Indigo
    "#9900ff", // Purple
    "#ff00ff", // Magenta
    "#990000", // Dark Red
    "#004d99", // Dark Blue
    "transparent", // No Color
  ]

  const highlightColors = [
    "#ffff00", // Yellow
    "#ffff8d", // Light Yellow
    "#fff59d", // Pale Yellow
    "#fffde7", // Very Pale Yellow
    "#fff8e1", // Cream
    "#ffcc80", // Light Orange
    "#ffab91", // Light Coral
    "#ffcdd2", // Light Pink
    "#f8bbd0", // Pink
    "#e1bee7", // Light Purple
    "#d1c4e9", // Lavender
    "#c5cae9", // Light Blue-Gray
    "#bbdefb", // Light Blue
    "#b3e5fc", // Sky Blue
    "#b2ebf2", // Light Cyan
    "#b2dfdb", // Light Teal
    "#c8e6c9", // Light Green
    "#dcedc8", // Pale Green
    "#f0f4c3", // Pale Lime
    "transparent", // No Highlight
  ]

  // Add this effect to handle clicks outside the color pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(event.target as Node)) {
        setShowTextColorPicker(false)
      }
      if (highlightColorRef.current && !highlightColorRef.current.contains(event.target as Node)) {
        setShowHighlightColorPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const slashCommandsRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorContentRef = useRef<HTMLDivElement>(null)

  // 格式刷状态
  const [formatPainterState, setFormatPainterState] = useState<FormatPainterState>({
    active: false,
    marks: null,
  })

  // Custom floating menu state
  const [showFloatingMenu, setShowFloatingMenu] = useState(false)
  const [floatingMenuPosition, setFloatingMenuPosition] = useState({ top: 0, left: 0 })

  // For debugging
  const [debugInfo, setDebugInfo] = useState<any>({})

  // 创建一个Yjs文档用于协作功能（如果需要）
  const ydoc = useRef<Y.Doc | null>(null)

  // Calculate the position of the slash command menu relative to the editor content
  const calculateMenuPosition = useCallback((coords: { left: number; bottom: number }) => {
    if (!editorContentRef.current) return { top: coords.bottom, left: coords.left }

    // Get the editor content element's position
    const editorRect = editorContentRef.current.getBoundingClientRect()

    // Calculate position relative to the editor content
    const top = coords.bottom - editorRect.top + 5 // Add a small offset
    const left = coords.left - editorRect.left

    return { top, left }
  }, [])

  // Define updateFloatingMenuVisibility before it's used in any dependency arrays
  const updateFloatingMenuVisibility = useCallback((editor: Editor | null) => {
    if (!editor || !editorContentRef.current) {
      setShowFloatingMenu(false)
      return
    }

    // Check if selection is empty (cursor only)
    const isSelectionEmpty = editor.view.state.selection.empty

    // Get the current position
    const { $head } = editor.view.state.selection

    // Debug info
    const debugData = {
      isSelectionEmpty,
      isAtStart: $head.parentOffset === 0,
      isEmpty: $head.parent.content.size === 0,
      nodeType: $head.parent.type.name,
      nodeContent: $head.parent.textContent,
      contentSize: $head.parent.content.size,
    }

    console.log(debugData)
    setDebugInfo(debugData)

    // Show floating menu if we're at an empty paragraph or heading
    const isEmptyTextBlock =
      isSelectionEmpty &&
      ($head.parent.type.name === "paragraph" || $head.parent.type.name.startsWith("heading")) &&
      $head.parent.textContent === ""

    if (isEmptyTextBlock) {
      // Get the DOM coordinates of the cursor
      const coords = editor.view.coordsAtPos($head.pos)

      // Set position for the floating menu
      setFloatingMenuPosition({
        top: coords.top,
        left: coords.left - 40, // Position it 40px to the left of the cursor
      })

      console.log("Setting floating menu visible: true", {
        top: coords.top,
        left: coords.left - 40,
      })
      setShowFloatingMenu(true)
    } else {
      console.log("Setting floating menu visible: false")
      setShowFloatingMenu(false)
    }
  }, [])

  // 仅在客户端初始化Yjs文档
  useEffect(() => {
    if (typeof window !== "undefined" && !ydoc.current) {
      ydoc.current = new Y.Doc()
    }
  }, [])

  // Initialize editor
  const editor = useEditor({
    extensions: [
      // 使用StarterKit作为基础，但禁用heading以使用自定义的HeadingWithData
      StarterKit.configure({
        heading: false,
        strike: false, // 禁用内置的删除线，使用我们自己导入的
      }),
      // 使用自定义的HeadingWithData替代标准Heading
      HeadingWithData.configure({
        levels: [1, 2, 3, 4],
      }),
      // 添加额外的扩展
      BulletList,
      OrderedList,
      TaskList,
      // TaskItem.configure({
      //   nested: true,
      //   allowGapCursor: true,
      //   HTMLAttributes: {
      //     class: 'flex items-start gap-2',
      //   },
      // }),
      CustomTaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      HorizontalRule,
      Dropcursor,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline,
      Strike, // 添加删除线扩展
      Subscript,
      Superscript,
      Typography,
      CodeBlock,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: "输入 / 唤起命令菜单...",
      }),
      Focus.configure({
        className: "has-focus",
        mode: "all",
      }),
      CharacterCount.configure({
        limit: 10000,
      }),

      // 表格扩展
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 table-fixed w-full",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-gray-300",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100 font-bold",
        },
      }),

      // 自定义扩展
      Citation.configure({
        HTMLAttributes: {},
      }),
      PrototypeReference.configure({
        HTMLAttributes: {},
      }),
      ClarificationParagraph.configure({
        HTMLAttributes: {},
      }),
      ImageUpload.configure({
        HTMLAttributes: {},
      }),

      // 协作扩展（如果需要）
      ydoc.current
        ? Collaboration.configure({
            document: ydoc.current,
          })
        : null,
      ydoc.current
        ? CollaborationCursor.configure({
            provider: null, // 需要一个Y.js provider
            user: {
              name: "用户",
              color: "#ffcc00",
            },
          })
        : null,
    ].filter(Boolean), // 过滤掉null值
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML())
      }

      // 当编辑器内容更新时，提取大纲并通知父组件
      if (onOutlineChange) {
        const outline = extractOutline(editor)
        onOutlineChange(outline)
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // 检查是否选中了表格
      const tableActive = editor.isActive("table")
      console.log("Selection update - Table active:", tableActive)
      setIsTableSelected(tableActive)

      // Update floating menu
      updateFloatingMenuVisibility(editor)

      // Get selected text when selection changes
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedContent = editor.state.doc.textBetween(from, to, " ")
        setSelectedText(selectedContent)
      } else {
        setSelectedText("")
      }
    },
    onFocus: ({ editor }) => {
      // 也在这里检查，以防在点击表格时没有触发selectionUpdate
      const tableActive = editor.isActive("table")
      console.log("Focus - Table active:", tableActive)
      setIsTableSelected(tableActive)

      // Update floating menu
      updateFloatingMenuVisibility(editor)
    },
    onTransaction: ({ editor }) => {
      // 在每次事务后检查表格状态
      const tableActive = editor.isActive("table")
      console.log("Transaction - Table active:", tableActive)
      setIsTableSelected(tableActive)

      // Update floating menu
      updateFloatingMenuVisibility(editor)
    },
  })

  // Define handlePlusButtonClick after editor is initialized
  const handlePlusButtonClick = useCallback(() => {
    if (!editor) return

    console.log("Handling plus button click")

    // Force focus on the editor first
    editor.commands.focus()

    const { view } = editor
    const { state } = view
    const { selection } = state
    const { $from } = selection
    const coords = view.coordsAtPos($from.pos)

    // Calculate the position for the slash command menu
    const position = calculateMenuPosition(coords)

    // Set the position for the slash command menu
    setSlashCommandPosition(position)

    // Use a small timeout to ensure the state is updated
    setTimeout(() => {
      setShowSlashCommands(true)
    }, 10)
  }, [editor, calculateMenuPosition])

  // 添加点击事件监听器来检测表格点击
  useEffect(() => {
    if (!editor || !editorContentRef.current) return

    const handleClick = (event: MouseEvent) => {
      // 检查点击的元素是否在表格内
      const target = event.target as HTMLElement
      const isInTable = !!target.closest("table")

      if (isInTable) {
        console.log("Click detected inside table")
        setIsTableSelected(true)
      }

      // Update floating menu on click
      updateFloatingMenuVisibility(editor)
    }

    const editorElement = editorContentRef.current
    editorElement.addEventListener("click", handleClick)

    return () => {
      editorElement.removeEventListener("click", handleClick)
    }
  }, [editor, updateFloatingMenuVisibility])

  // Add event listener for citation clicks
  const handleCitationClick = useCallback(() => {
    if (onCitationClick) {
      onCitationClick()
    }
  }, [onCitationClick])

  useEffect(() => {
    document.addEventListener("citation-click", handleCitationClick)
    return () => {
      document.removeEventListener("citation-click", handleCitationClick)
    }
  }, [handleCitationClick])

  // Add event listener for prototype reference clicks
  useEffect(() => {
    if (!onPrototypeClick) return

    const handlePrototypeClick = (event: Event) => {
      const customEvent = event as CustomEvent
      onPrototypeClick(customEvent.detail.id)
    }

    // Listen for our custom prototype-click event
    document.addEventListener("prototype-click", handlePrototypeClick)

    return () => {
      document.removeEventListener("prototype-click", handlePrototypeClick)
    }
  }, [onPrototypeClick])

  // Add event listener for section navigation
  useEffect(() => {
    const handleNavigateToSection = (event: Event) => {
      const customEvent = event as CustomEvent
      const sectionId = customEvent.detail.sectionId

      if (!editor || !editorContentRef.current) return

      // Find the ProseMirror element
      const editorElement = editorContentRef.current.querySelector(".ProseMirror")
      if (!editorElement) {
        console.error("ProseMirror element not found")
        return
      }

      // Find the heading with the matching data-section-id
      const targetHeading = editorElement.querySelector(`[data-section-id="${sectionId}"]`)

      if (targetHeading) {
        // Log for debugging
        console.log(`Found section: ${sectionId}`, targetHeading)

        // Scroll to the heading
        targetHeading.scrollIntoView({ behavior: "smooth", block: "start" })

        // Add a highlight effect to show where we navigated to
        targetHeading.classList.add("bg-yellow-100")
        setTimeout(() => {
          targetHeading.classList.remove("bg-yellow-100")
        }, 2000)
      } else {
        console.error(`Section not found: ${sectionId}`)

        // Debug: log all section IDs in the document
        const allSections = editorElement.querySelectorAll("[data-section-id]")
        console.log(
          "Available sections:",
          Array.from(allSections).map((el) => el.getAttribute("data-section-id")),
        )
      }
    }

    document.addEventListener("navigate-to-section", handleNavigateToSection)

    return () => {
      document.removeEventListener("navigate-to-section", handleNavigateToSection)
    }
  }, [editor])

  // Add event listener for clarification paragraph clicks
  useEffect(() => {
    const handleClarificationClick = (event: MouseEvent) => {
      if (!editorContentRef.current) return

      // 查找最近的 clarification-paragraph 元素
      const target = event.target as HTMLElement
      const clarificationParagraph = target.closest(".clarification-paragraph")

      if (clarificationParagraph) {
        const rect = clarificationParagraph.getBoundingClientRect()

        // 检查点击是否在段落的右上角区域（问号图标区域）
        const isTopRightCorner =
          event.clientX > rect.right - 30 &&
          event.clientX < rect.right &&
          event.clientY > rect.top &&
          event.clientY < rect.top + 30

        if (isTopRightCorner) {
          // 获取段落内容
          const text = clarificationParagraph.textContent || ""
          setClarificationText(text)

          // 计算对话框位置
          setClarificationPosition({
            top: event.clientY + window.scrollY,
            left: event.clientX + window.scrollX,
          })

          setShowClarificationDialog(true)
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }

    document.addEventListener("click", handleClarificationClick)

    return () => {
      document.removeEventListener("click", handleClarificationClick)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply format painter when active
  useEffect(() => {
    if (!editor || !formatPainterState.active || !formatPainterState.marks) return

    const handleSelectionChange = () => {
      const { from, to } = editor.view.state.selection
      if (from !== to) {
        // 有新的选择，应用格式
        formatPainterState.marks.forEach((mark: any) => {
          if (mark.type.name === "bold") {
            editor.chain().focus().setMark("bold").run()
          }
          if (mark.type.name === "italic") {
            editor.chain().focus().setMark("italic").run()
          }
          if (mark.type.name === "underline") {
            editor.chain().focus().setMark("underline").run()
          }
          if (mark.type.name === "strike") {
            editor.chain().focus().setMark("strike").run()
          }
          if (mark.type.name === "highlight") {
            editor.chain().focus().setMark("highlight", { color: mark.attrs.color }).run()
          }
          if (mark.type.name === "textStyle") {
            editor.chain().focus().setMark("textStyle", { color: mark.attrs.color }).run()
          }
        })

        // 应用一次后关闭格式刷
        setFormatPainterState({
          active: false,
          marks: null,
        })
      }
    }

    editor.on("selectionUpdate", handleSelectionChange)
    return () => {
      editor.off("selectionUpdate", handleSelectionChange)
    }
  }, [editor, formatPainterState, setFormatPainterState])

  const slashCommandItems: CommandItem[] = [
    {
      title: "文本",
      description: "普通段落文本",
      icon: <Type className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().setParagraph().run(),
    },
    {
      title: "标题 1",
      description: "大标题",
      icon: <Heading1 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "标题 2",
      description: "中标题",
      icon: <Heading2 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "标题 3",
      description: "小标题",
      icon: <Heading3 className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "无序列表",
      description: "项目符号列表",
      icon: <List className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "有序列表",
      description: "数字编号列表",
      icon: <ListOrdered className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "任务列表",
      description: "可勾选的任务列表",
      icon: <ListChecks className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().toggleTaskList().run()
      },
    },
    {
      title: "引用",
      description: "引用文本块",
      icon: <Quote className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "代码块",
      description: "格式化的代码块",
      icon: <Code className="h-4 w-4" />,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "图片",
      description: "插入图片上传区域",
      icon: <ImageIcon className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().setImageUpload().run()
      },
    },
    {
      title: "表格",
      description: "插入表格",
      icon: <TableIcon className="h-4 w-4" />,
      command: (editor) => {
        editor
          .chain()
          .focus()
          .insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true,
          })
          .run()
      },
    },
    {
      title: "引用文档",
      description: "引用外部文档",
      icon: <FileText className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().setCitation("1").run()
        if (onCitationClick) {
          setTimeout(() => onCitationClick(), 100)
        }
      },
    },
    {
      title: "产品原型",
      description: "插入产品原型引用",
      icon: <Layers className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().setPrototypeReference("default").run()
        if (onPrototypeClick) {
          setTimeout(() => onPrototypeClick("default"), 100)
        }
      },
    },
    {
      title: "需求澄清段落",
      description: "标记需要澄清的段落",
      icon: <HelpCircle className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().setClarificationParagraph().run()
      },
    },
    {
      title: "水平线",
      description: "插入水平分隔线",
      icon: <Minus className="h-4 w-4" />,
      command: (editor) => {
        editor.chain().focus().setHorizontalRule().run()
      },
    },
  ]

  // Define handleKeyDown after editor is initialized
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editor) return

      if (event.key === "/") {
        // Get the current cursor position
        const { view } = editor
        const { state } = view
        const { selection } = state
        const { $from } = selection

        // Get the DOM coordinates of the cursor
        const coords = view.coordsAtPos($from.pos)

        // Calculate the position for the slash command menu
        const position = calculateMenuPosition(coords)

        // Set the position for the slash command menu
        setSlashCommandPosition(position)

        // Show the slash command menu after a short delay to allow the "/" to be entered
        setTimeout(() => {
          setShowSlashCommands(true)
        }, 50)
      } else if (event.key === "Escape" && showSlashCommands) {
        setShowSlashCommands(false)
      }
    },
    [editor, showSlashCommands, calculateMenuPosition],
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (slashCommandsRef.current && !slashCommandsRef.current.contains(event.target as Node)) {
        setShowSlashCommands(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Safe content setting function
  const safelySetContent = (html: string) => {
    if (!editor) return false

    try {
      // Try to set content safely
      editor.commands.setContent(html, false)
      if (onUpdate) {
        onUpdate(html)
      }
      return true
    } catch (error) {
      console.error("Error setting content:", error)

      // If setting content fails, try to recover with a simplified version
      try {
        // Create a temporary div to sanitize the HTML
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = html

        // Get the sanitized HTML
        const sanitizedHtml = tempDiv.innerHTML

        // Try setting the sanitized content
        editor.commands.setContent(sanitizedHtml, false)
        if (onUpdate) {
          onUpdate(sanitizedHtml)
        }
        return true
      } catch (fallbackError) {
        console.error("Fallback error setting content:", fallbackError)
        return false
      }
    }
  }

  // Handle opening the edit options dialog
  const handleOpenEditOptions = useCallback(
    (position: { top: number; left: number }) => {
      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Dialog dimensions (approximate)
      const dialogWidth = 396 // 396px is the width we set in the component (w-96 + padding)
      const dialogHeight = 400 // Approximate height

      // Adjust position to ensure dialog stays within viewport
      let adjustedTop = position.top
      let adjustedLeft = position.left

      // Check right edge
      if (adjustedLeft + dialogWidth > viewportWidth) {
        adjustedLeft = Math.max(0, viewportWidth - dialogWidth - 20) // 20px padding
      }

      // Check bottom edge
      if (adjustedTop + dialogHeight > viewportHeight) {
        adjustedTop = Math.max(0, viewportHeight - dialogHeight - 20) // 20px padding
      }

      // Calculate line numbers (approximate)
      if (editor) {
        const { from, to } = editor.state.selection

        // Get the document content up to the selection
        const contentBefore = editor.state.doc.textBetween(0, from, "\n")
        const contentTotal = editor.state.doc.textBetween(0, to, "\n")

        // Count line breaks to determine line numbers
        const startLineNum = (contentBefore.match(/\n/g) || []).length + 1
        const endLineNum = (contentTotal.match(/\n/g) || []).length + 1

        setStartLine(startLineNum)
        setEndLine(endLineNum)
      }

      // Set the adjusted position
      setEditOptionsPosition({
        top: adjustedTop,
        left: adjustedLeft,
      })

      setShowEditOptions(true)
    },
    [editor],
  )

  // Add keyboard shortcut handling for confirmation dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we have an active confirmation dialog
      const confirmationDialog = document.querySelector(".edit-confirmation-dialog")
      if (!confirmationDialog) return

      // Handle Accept with Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        const acceptButton = confirmationDialog.querySelector('button[data-action="accept"]')
        if (acceptButton) {
          ;(acceptButton as HTMLButtonElement).click()
        }
      }

      // Handle Reject with Escape
      if (e.key === "Escape") {
        e.preventDefault()
        const rejectButton = confirmationDialog.querySelector('button[data-action="reject"]')
        if (rejectButton) {
          ;(rejectButton as HTMLButtonElement).click()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Add event listeners for editor updates
  useEffect(() => {
    if (editor) {
      const handleEditorUpdate = () => {
        updateFloatingMenuVisibility(editor)
      }

      editor.on("selectionUpdate", handleEditorUpdate)
      editor.on("update", handleEditorUpdate)

      return () => {
        editor.off("selectionUpdate", handleEditorUpdate)
        editor.off("update", handleEditorUpdate)
      }
    }
  }, [editor, updateFloatingMenuVisibility])

  // Initialize outline on mount
  useEffect(() => {
    if (editor && onOutlineChange) {
      const outline = extractOutline(editor)
      onOutlineChange(outline)
    }
  }, [editor, onOutlineChange])

  if (!isMounted) {
    return null
  }

  // Add this function to handle version changes
  const handleVersionChange = (versionId: number) => {
    // setCurrentVersion(versionId)
    if (onVersionChange) {
      onVersionChange(versionId)
    }
    const version = documentVersions.find((v) => v.id === versionId)
    if (version && editor) {
      editor.commands.setContent(version.content)
    }
  }

  // Add this function to handle accepting edits
  const handleAcceptEdit = (newContent: string) => {
    if (editor) {
      // Update the editor content
      editor.commands.setContent(newContent)

      // Create a new version
      // const newVersionId = currentVersion + 1
      // const newVersion = {
      //   id: newVersionId,
      //   content: newContent,
      //   timestamp: "just now",
      // }

      // Update versions and set current version
      // setDocumentVersions([newVersion, ...documentVersions])
      // setCurrentVersion(newVersionId)
    }
  }

  return (
    <div className="border rounded-md overflow-hidden relative" ref={editorRef}>
      {editable && (
        <MenuBar
          editor={editor}
          onCitationClick={onCitationClick}
          onPrototypeClick={onPrototypeClick}
          setShowSourceCodeEditor={setShowSourceCodeEditor}
          formatPainterState={formatPainterState}
          setFormatPainterState={setFormatPainterState}
          // Add these new props
          showTextColorPicker={showTextColorPicker}
          setShowTextColorPicker={setShowTextColorPicker}
          showHighlightColorPicker={showHighlightColorPicker}
          setShowHighlightColorPicker={setShowHighlightColorPicker}
          textColorRef={textColorRef}
          highlightColorRef={highlightColorRef}
          textColors={textColors}
          highlightColors={highlightColors}
        />
      )}

      <div className="absolute top-2 right-2 z-20">
        <VersionDropdown
          currentVersion={currentVersion || 0}
          onVersionChange={onVersionChange}
          versions={versions || []}
        />
      </div>

      {/* Render the floating menu button directly in the component */}
      {showFloatingMenu &&
        isMounted &&
        createPortal(
          <FloatingMenuButton position={floatingMenuPosition} onClick={handlePlusButtonClick} />,
          document.body,
        )}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor }) => !editor.view.state.selection.empty}
        >
          <div className="flex flex-wrap bg-white rounded-lg shadow-lg p-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 p-0 ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`h-8 w-8 p-0 ${editor.isActive("strike") ? "bg-gray-200" : ""}`}
            >
              <StrikethroughIcon className="h-4 w-4" />
            </Button>

            {/* Color picker button */}
            <div className="relative" ref={textColorRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                className={`h-8 w-8 p-0 ${editor.isActive("textStyle") ? "bg-gray-200" : ""}`}
              >
                <Palette className="h-4 w-4" />
              </Button>
              <ColorPicker
                colors={textColors}
                onSelect={(color) => editor.chain().focus().setColor(color).run()}
                isOpen={showTextColorPicker}
                onClose={() => setShowTextColorPicker(false)}
                title="文字颜色"
              />
            </div>

            {/* Highlight button */}
            <div className="relative" ref={highlightColorRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHighlightColorPicker(!showHighlightColorPicker)}
                className={`h-8 w-8 p-0 ${editor.isActive("highlight") ? "bg-gray-200" : ""}`}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <ColorPicker
                colors={highlightColors}
                onSelect={(color) => {
                  if (color === "transparent") {
                    editor.chain().focus().unsetHighlight().run()
                  } else {
                    editor.chain().focus().toggleHighlight({ color }).run()
                  }
                }}
                isOpen={showHighlightColorPicker}
                onClose={() => setShowHighlightColorPicker(false)}
                title="高亮颜色"
              />
            </div>

            {/* Help/clarification button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editor.isActive("clarificationParagraph")) {
                  editor.chain().focus().unsetClarificationParagraph().run()
                } else {
                  editor.chain().focus().setClarificationParagraph().run()
                }
              }}
              className={`h-8 w-8 p-0 ${editor.isActive("clarificationParagraph") ? "bg-gray-200" : ""}`}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Link button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt("URL")
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run()
                } else {
                  editor.chain().focus().unsetLink().run()
                }
              }}
              className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            {/* Edit button with text */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Get the current selection position
                const { view } = editor
                const { state } = view
                const { selection } = state
                const { from } = selection
                const coords = view.coordsAtPos(from)

                // Hide the bubble menu by deselecting
                // This is a trick to hide the bubble menu without actually losing the selection
                const currentSelection = window.getSelection()
                if (currentSelection) {
                  // Store the current selection range
                  const range = currentSelection.getRangeAt(0)

                  // Open edit options dialog
                  handleOpenEditOptions({
                    top: coords.top + window.scrollY,
                    left: coords.left + window.scrollX,
                  })

                  // Restore the selection after a brief delay
                  setTimeout(() => {
                    currentSelection.removeAllRanges()
                    currentSelection.addRange(range)
                  }, 10)
                }
              }}
              className="h-8 px-3"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>编辑</span>
            </Button>

            {/* Copy button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const selection = editor.view.state.selection
                const text = editor.view.state.doc.textBetween(selection.from, selection.to)
                navigator.clipboard.writeText(text)
              }}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      <div onKeyDown={handleKeyDown} ref={editorContentRef}>
        <EditorContent editor={editor} className="p-4 prose max-w-none" />
      </div>

      {/* 表格控制菜单 */}
      {editor && isTableSelected && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4">
          <div className="bg-white border rounded-lg shadow-lg">
            <TableMenu editor={editor} isTableSelected={isTableSelected} />
          </div>
        </div>
      )}

      {showSlashCommands && editor && (
        <div
          ref={slashCommandsRef}
          className="absolute z-10"
          style={{
            top: `${slashCommandPosition.top}px`,
            left: `${slashCommandPosition.left}px`,
          }}
        >
          <SlashCommandList editor={editor} items={slashCommandItems} onClose={() => setShowSlashCommands(false)} />
        </div>
      )}

      {showClarificationDialog && (
        <RequirementClarificationDialog
          onClose={() => setShowClarificationDialog(false)}
          requirement={clarificationText}
          position={clarificationPosition}
        />
      )}

      {showEditOptions && (
        <div
          className="fixed z-[9999]"
          style={{
            top: `${editOptionsPosition.top}px`,
            left: `${editOptionsPosition.left}px`,
          }}
        >
          <EditOptionsDialog
            onClose={() => setShowEditOptions(false)}
            selectedText={selectedText}
            startLine={startLine}
            endLine={endLine}
          />
        </div>
      )}

      {showSourceCodeEditor && (
        <SourceCodeEditor
          content={editor ? editor.getHTML() : ""}
          onClose={() => setShowSourceCodeEditor(false)}
          onSave={(html) => {
            if (editor) {
              // Use the safe content setting function
              safelySetContent(html)
            }
          }}
        />
      )}
    </div>
  )
}
