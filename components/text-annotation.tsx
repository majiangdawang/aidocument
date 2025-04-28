"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

export function TextAnnotation({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("")

  return (
    <Card className="shadow-lg w-64">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">添加注释</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          className="w-full h-24 p-2 text-sm border rounded-md"
          placeholder="输入注释内容..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" variant="outline" className="mr-2" onClick={onClose}>
            取消
          </Button>
          <Button size="sm">保存</Button>
        </div>
      </div>
    </Card>
  )
}
