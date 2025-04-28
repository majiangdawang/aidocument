"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Wand2, FileText, ArrowRight } from "lucide-react"

export function AiCapabilityMenu() {
  return (
    <Card className="shadow-lg p-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Search className="h-4 w-4" />
          <span className="text-xs">检索</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">询问</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Wand2 className="h-4 w-4" />
          <span className="text-xs">生成</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span className="text-xs">摘要</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <ArrowRight className="h-4 w-4" />
          <span className="text-xs">更多</span>
        </Button>
      </div>
    </Card>
  )
}
