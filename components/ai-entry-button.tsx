"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function AiEntryButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg" onClick={onClick}>
        <Sparkles className="h-5 w-5" />
      </Button>
      <div className="absolute -top-16 right-0 bg-red-500 text-white p-2 rounded text-xs w-64">
        点击AI功能入口（进入后可从上文文字选取内容作提示，需要文档正文，避免选择表格文件）
        <div className="absolute bottom-0 right-4 w-2 h-2 bg-red-500 rotate-45 translate-y-1"></div>
      </div>
    </div>
  )
}
