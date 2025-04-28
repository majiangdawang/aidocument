"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, MessageSquare, Search, FileText, Highlighter } from "lucide-react"

export function ContextMenu({ onClose, position }: { onClose: () => void; position: { top: number; left: number } }) {
  return (
    <div className="absolute z-50" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      <Card className="shadow-lg p-2">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Copy className="h-4 w-4 mr-2" />
            <span className="text-sm">复制</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-sm">询问AI</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">搜索</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">添加注释</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Highlighter className="h-4 w-4 mr-2" />
            <span className="text-sm">高亮显示</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
