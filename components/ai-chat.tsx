"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Send } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AiChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "您好，我是AI助手。我可以帮您解答关于药品字典需求规格说明书的问题。请问有什么可以帮助您的？",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: "user", content: input }]

    setMessages(newMessages)
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "我已收到您的问题，正在分析相关内容。根据药品字典需求规格说明书，这个问题涉及到系统的业务领域和功能范围。您可以在第二章业务领域说明中找到更详细的信息。还有其他问题吗？",
        },
      ])
    }, 1000)
  }

  return (
    <Card className="shadow-lg w-80 flex flex-col h-96">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">AI对话</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 text-sm border rounded-md"
            placeholder="输入问题..."
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
