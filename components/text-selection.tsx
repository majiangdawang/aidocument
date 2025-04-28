"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Copy, MessageSquare } from "lucide-react"

export function TextSelection({ onClose }: { onClose: () => void }) {
  return (
    <Card className="shadow-lg p-3 max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">已选择文本</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 bg-gray-100 rounded-md text-sm mb-3">
        我察觉到您正在查看需求规格说明书，请根据您的需求选择以下选项：解释术语，提供需求来源相关文档，帮我将需求整理成计划任务
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex items-center">
          <Copy className="h-4 w-4 mr-1" />
          复制
        </Button>
        <Button size="sm" variant="outline" className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          询问AI
        </Button>
      </div>
    </Card>
  )
}
