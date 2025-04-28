"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, MessageSquare, Highlighter, Search, Wand2 } from "lucide-react"

interface TextSelectionTooltipProps {
  onClose: () => void
  onAiAnalysis?: () => void
}

export function TextSelectionTooltip({ onClose, onAiAnalysis }: TextSelectionTooltipProps) {
  return (
    <Card className="shadow-lg p-1 flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAiAnalysis}>
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Wand2 className="h-4 w-4" />
      </Button>
    </Card>
  )
}
