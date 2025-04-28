"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function AiTextSelection({ onClose }: { onClose: () => void }) {
  return (
    <Card className="shadow-lg p-3 max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">AI分析选中内容</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 bg-gray-100 rounded-md text-sm mb-3">
        <p className="font-medium">选中内容：</p>
        <p className="text-gray-700">
          为提高药品信息管理的标准化和严谨性，需构建分层级联的药品字典，支持药品、商品、价格三层数据结构，适配多业务场景的整合需求。
        </p>
      </div>
      <div className="space-y-3">
        <div className="p-2 border rounded-md">
          <p className="font-medium text-sm">AI分析结果：</p>
          <p className="text-sm text-gray-700">
            这段文本描述了药品字典的需求背景，强调了构建分层级联结构的必要性。主要包含以下关键点：
          </p>
          <ul className="text-sm text-gray-700 list-disc pl-5 mt-1">
            <li>目标：提高药品信息管理的标准化和严谨性</li>
            <li>解决方案：构建分层级联的药品字典</li>
            <li>数据结构：支持药品、商品、价格三层数据结构</li>
            <li>适用范围：适配多业务场景的整合需求</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button size="sm">生成需求描述</Button>
          <Button size="sm" variant="outline">
            提取关键点
          </Button>
          <Button size="sm" variant="outline">
            相关文档
          </Button>
        </div>
      </div>
    </Card>
  )
}
