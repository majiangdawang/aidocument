"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function AiAssistant({ onClose }: { onClose: () => void }) {
  return (
    <Card className="w-80 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">AI助手</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm">
          <p className="mb-2">我察觉到您正在查看需求规格说明书，请根据您的需求选择以下选项：</p>
          <ul className="space-y-2">
            <li>
              <Button variant="outline" size="sm" className="w-full justify-start">
                查看相关文档
              </Button>
            </li>
            <li>
              <Button variant="outline" size="sm" className="w-full justify-start">
                解释术语
              </Button>
            </li>
            <li>
              <Button variant="outline" size="sm" className="w-full justify-start">
                提供需求模板
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
