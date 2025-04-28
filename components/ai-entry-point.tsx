"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MessageSquare, Zap, Search, FileText, Layout } from "lucide-react"

export function AiEntryPoint({ onClose }: { onClose: () => void }) {
  return (
    <Card className="shadow-lg w-64">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">更多AI功能</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">需求检索</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">自动格式调整</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Layout className="h-4 w-4 mr-2" />
            <span className="text-sm">互联业务流程图</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-sm">生成需求描述</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Zap className="h-4 w-4 mr-2" />
            <span className="text-sm">生成产品方案PPT</span>
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          提示：AI功能入口（进入后可从上文文字选取内容作提示，需要文档正文，避免选择表格文件）
        </div>
      </div>
    </Card>
  )
}
