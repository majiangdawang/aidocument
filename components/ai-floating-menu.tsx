"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Search, FileText, Layout, Share2, MessageSquare, FileOutput } from "lucide-react"

export function AiFloatingMenu({ onClose }: { onClose: () => void }) {
  return (
    <Card className="shadow-lg">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">更多AI功能</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">需求检索</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">自动格式调整</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Layout className="h-4 w-4 mr-2" />
            <span className="text-sm">互联业务流程图</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-sm">生成需求描述</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="text-sm">生成产品方案PPT</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <FileOutput className="h-4 w-4 mr-2" />
            <span className="text-sm">生成产品原型</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
