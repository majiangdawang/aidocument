import type React from "react"
import { Card } from "@/components/ui/card"

export function AiTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-2 shadow-lg max-w-xs">
      <div className="text-xs">{children}</div>
    </Card>
  )
}
