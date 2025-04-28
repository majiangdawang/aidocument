"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MessageSquare, Send } from "lucide-react"

interface RequirementClarificationDialogProps {
  onClose: () => void
  requirement: string
  position?: { top: number; left: number }
}

export function RequirementClarificationDialog({
  onClose,
  requirement,
  position,
}: RequirementClarificationDialogProps) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "以下是需要澄清的需求内容：",
    },
    {
      role: "system",
      content: requirement,
    },
    {
      role: "assistant",
      content: "您好，关于这条需求，您有什么需要澄清的问题吗？",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: input }])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      let response = "感谢您的问题。我会尽力解答。"

      // Simple response logic based on keywords
      if (input.includes("分层级联") || input.includes("三层数据结构")) {
        response =
          "分层级联的药品字典是指将药品信息按照药品、商品、价格三个层级进行组织。药品层包含基础药物信息如通用名、药理分类；商品层包含同一药品的不同厂商和规格信息；价格层包含同一商品在不同场景下的定价规则。这种结构能够适配多种业务场景的需求。"
      } else if (input.includes("多业务场景") || input.includes("整合需求")) {
        response =
          "多业务场景是指药品字典需要支持医药诊疗、皮试试剂等不同的应用场景。整合需求是指需要将这些不同场景下的药品信息统一管理，避免数据孤岛和信息不一致的问题。"
      } else if (input.includes("标准化") || input.includes("严谨性")) {
        response =
          "提高药品信息管理的标准化和严谨性是指建立统一的数据标准和规范，确保药品信息的准确性、一致性和完整性，减少因信息不准确或不完整导致的医疗风险。"
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    }, 1000)
  }

  const positionStyle = position
    ? {
        position: "absolute" as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
      }
    : {}

  return (
    <Card className="shadow-lg w-96 flex flex-col h-[400px] z-50" style={positionStyle}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
          需求澄清对话
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {messages.map((message, index) => {
          if (message.role === "system") {
            return index === 1 ? (
              <div key={index} className="bg-yellow-100 p-2 rounded-md border-l-4 border-yellow-500">
                <p className="text-sm">{message.content}</p>
              </div>
            ) : null
          }
          return (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-2 rounded-lg ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 text-sm border rounded-md"
            placeholder="输入您的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
