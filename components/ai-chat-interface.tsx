"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  X,
  Plus,
  History,
  FileText,
  MessageSquare,
  ChevronRight,
  Paperclip,
  MoreHorizontal,
  Clock,
  AtSign,
  Send,
  FileOutput,
} from "lucide-react"
import { FileSelectionDropdown } from "./file-selection-dropdown"
// First, import the TaskStatus component at the top of the file
import { TaskStatus, type Task as TaskType } from "@/components/task-status"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
  messageCount?: number
}

interface File {
  id: string
  name: string
  type: string
  path: string
  icon: React.ReactNode
}

interface Task extends TaskType {}

// Add these interfaces to the existing interfaces section
interface ConversationTaskGroup {
  conversationId: string
  title: string
  timestamp: Date
  tasks: Task[]
  taskGroupId?: string
}

const possibleTaskNames = [
  "分析用户问题",
  "检索相关文档",
  "生成回复内容",
  "优化回复格式",
  "检查信息准确性",
  "应用上下文理解",
  "提取关键信息",
  "查询知识库",
  "生成代码示例",
  "格式化输出结果",
  "检查语法错误",
  "优化表达方式",
  "分析情感倾向",
  "提取实体信息",
  "生成摘要内容",
  "检索相似案例",
  "应用领域知识",
  "构建回复框架",
  "检查逻辑一致性",
  "优化专业术语",
]

const additionalTasks = [
  "处理新的用户输入",
  "分析问题上下文",
  "检索最新相关信息",
  "整合历史对话内容",
  "生成针对性回复",
  "优化回复结构",
  "检查回复准确性",
  "应用最新知识",
  "提取用户意图",
  "生成补充信息",
]

interface AiChatInterfaceProps {
  onClose: () => void
  isEmptyProject?: boolean
  onGenerateDocument?: () => void
  initialMessage?: string // Add this prop
}

export function AiChatInterface({
  onClose,
  isEmptyProject = false,
  onGenerateDocument,
  initialMessage = "", // Add default value
}: AiChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "files">("chat")
  const [input, setInput] = useState(initialMessage) // Initialize with initialMessage
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [chatHistory, setChatHistory] = useState<Chat[]>([
    {
      id: "1",
      title: "药品字典需求分析",
      lastMessage: "请帮我分析药品字典的核心需求",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      messageCount: 1,
      messages: [
        {
          id: "1-1",
          role: "user",
          content: "请帮我分析药品字典的核心需求",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: "1-2",
          role: "assistant",
          content:
            "根据需求文档，药品字典的核心需求包括：1. 分层级联的数据结构（药品、商品、价格三层）；2. 支持多业务场景的整合；3. 提高药品信息管理的标准化和严谨性。",
          timestamp: new Date(Date.now() - 1000 * 60 * 29),
        },
      ],
    },
    {
      id: "2",
      title: "数据结构设计讨论",
      lastMessage: "三层数据结构如何实现？",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      messageCount: 1,
      messages: [
        {
          id: "2-1",
          role: "user",
          content: "三层数据结构如何实现？",
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
        },
        {
          id: "2-2",
          role: "assistant",
          content:
            "三层数据结构可以通过关联表实现：1. 药品表存储基础药品信息；2. 商品表通过外键关联药品表，存储厂商和规格信息；3. 价格表通过外键关联商品表，存储不同场景的价格策略。",
          timestamp: new Date(Date.now() - 1000 * 60 * 119),
        },
      ],
    },
  ])

  const [showFileDropdown, setShowFileDropdown] = useState(false)
  const [fileSearchTerm, setFileSearchTerm] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const atButtonRef = useRef<HTMLButtonElement>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [readyToGenerate, setReadyToGenerate] = useState(false)

  // Add a new state for task groups in the AiChatInterface component
  const [currentChatTasks, setCurrentChatTasks] = useState<ConversationTaskGroup[]>([])
  const [expandedTaskGroups, setExpandedTaskGroups] = useState<Record<string, boolean>>({})

  // Start a new chat if none is active
  useEffect(() => {
    if (!currentChat) {
      handleNewChat()
    }
  }, [currentChat])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentChat?.messages])

  // Add this effect to handle initialMessage
  useEffect(() => {
    if (initialMessage && currentChat && currentChat.messages.length === 1) {
      // If we have an initial message and only the welcome message in the chat
      handleSendMessage(initialMessage)
    }
  }, [initialMessage, currentChat])

  // Add this useEffect after the other useEffects in the component
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const { tasks, conversationId, title, completed, messageId, messageContent, isNewMessage, taskGroupId } =
        event.detail

      // Only update tasks for the current chat
      if (currentChat && conversationId === currentChat.id) {
        setCurrentChatTasks((prevGroups) => {
          // If it's a new message, check if a task group with the same ID already exists
          if (isNewMessage) {
            const existingGroupIndex = prevGroups.findIndex((g) => g.taskGroupId === taskGroupId)

            if (existingGroupIndex >= 0) {
              // If a task group with the same ID exists, update its tasks
              const updatedGroups = [...prevGroups]
              const existingGroup = { ...updatedGroups[existingGroupIndex] }

              // Update tasks
              existingGroup.tasks = tasks
              existingGroup.timestamp = new Date()

              // Update group
              updatedGroups[existingGroupIndex] = existingGroup

              return updatedGroups
            } else {
              // If no task group with the same ID exists, create a new one
              const newGroup: ConversationTaskGroup = {
                conversationId,
                title: title || messageContent || `Task ${prevGroups.length + 1}`,
                timestamp: new Date(),
                tasks,
                taskGroupId,
              }

              // Add the new task group to the beginning of the array
              return [newGroup, ...prevGroups]
            }
          } else {
            // If it's not a new message, update existing tasks
            const existingGroupIndex = prevGroups.findIndex((g) => g.taskGroupId === taskGroupId)

            if (existingGroupIndex >= 0) {
              // Update existing task group
              const updatedGroups = [...prevGroups]
              const existingGroup = { ...updatedGroups[existingGroupIndex] }

              // Update tasks
              existingGroup.tasks = tasks
              existingGroup.timestamp = new Date()

              // Update group
              updatedGroups[existingGroupIndex] = existingGroup

              return updatedGroups
            }

            return prevGroups
          }
        })
      }
    }

    // Listen for custom event
    document.addEventListener("ai-task-update", handleTaskUpdate as EventListener)

    return () => {
      document.removeEventListener("ai-task-update", handleTaskUpdate as EventListener)
    }
  }, [currentChat])

  // Add a function to toggle task group expansion
  const toggleTaskGroup = (groupId: string) => {
    setExpandedTaskGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const handleNewChat = () => {
    const initialAssistantMessage = isEmptyProject
      ? "您好，我是AI助手。请告诉我您的项目需求，我将帮助您生成需求规格说明书。您可以描述项目背景、目标、功能需求等内容。"
      : "您好，我是AI助手。我可以帮您解答关于药品字典需求规格说明书的问题。请问有什么可以帮助您的？"

    const newChat: Chat = {
      id: Date.now().toString(),
      title: "新对话",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      messages: [
        {
          id: Date.now().toString(),
          role: "assistant",
          content: initialAssistantMessage,
          timestamp: new Date(),
        },
      ],
    }

    setCurrentChat(newChat)
    setChatHistory([newChat, ...chatHistory])
    setActiveTab("chat")
  }

  // Generate tasks for a new message
  const generateTasksForMessage = (conversationId: string, messageId: string, messageIndex: number) => {
    const taskIndex = messageIndex % additionalTasks.length
    const taskName = additionalTasks[taskIndex]

    const numTasks = 3 + Math.floor(Math.random() * 2)
    const tasks: Task[] = []

    for (let i = 0; i < numTasks; i++) {
      const name = i === 0 ? taskName : possibleTaskNames[Math.floor(Math.random() * possibleTaskNames.length)]

      tasks.push({
        id: `${messageId}-task-${i + 1}`,
        name,
        status: i === 0 ? "in-progress" : "pending",
        executionTime: i === 0 ? 0.0 : undefined,
        conversationId,
        messageId,
      })
    }

    return tasks
  }

  // Simulate task execution for a message
  const simulateTaskExecution = (
    conversationId: string,
    conversationTitle: string,
    messageId: string,
    messageIndex: number,
    messageContent: string,
  ) => {
    const taskGroupTitle = messageContent.length > 10 ? messageContent.substring(0, 10) + "..." : messageContent
    const messageTasks = generateTasksForMessage(conversationId, messageId, messageIndex)
    const tasksWithContent = messageTasks.map((task) => ({
      ...task,
      messageContent: messageContent,
    }))
    const taskGroupId = messageContent

    const initialEvent = new CustomEvent("ai-task-update", {
      detail: {
        tasks: tasksWithContent,
        completed: false,
        conversationId,
        title: taskGroupTitle,
        messageId,
        messageContent,
        isNewMessage: true,
        taskGroupId,
      },
      bubbles: true,
    })
    document.dispatchEvent(initialEvent)

    processTasksSequentially(
      tasksWithContent,
      0,
      conversationId,
      taskGroupTitle,
      messageId,
      messageContent,
      taskGroupId,
    )
  }

  // Process tasks sequentially
  const processTasksSequentially = (
    tasks: Task[],
    currentIndex: number,
    conversationId: string,
    conversationTitle: string,
    messageId: string,
    messageContent: string,
    taskGroupId: string,
  ) => {
    if (currentIndex >= tasks.length) {
      return
    }

    const currentTask = tasks[currentIndex]
    let taskTime = 0
    const taskInterval = setInterval(() => {
      taskTime += 0.1
      const updatedTasks = [...tasks]
      updatedTasks[currentIndex].executionTime = taskTime

      const progressEvent = new CustomEvent("ai-task-update", {
        detail: {
          tasks: updatedTasks,
          completed: false,
          conversationId,
          title: conversationTitle,
          messageId,
          messageContent,
          isNewMessage: false,
          taskGroupId,
        },
        bubbles: true,
      })
      document.dispatchEvent(progressEvent)

      const completionTime = 1.0 + Math.random() * 1.5
      if (taskTime >= completionTime) {
        clearInterval(taskInterval)

        updatedTasks[currentIndex].status = "completed"

        if (currentIndex + 1 < updatedTasks.length) {
          updatedTasks[currentIndex + 1].status = "in-progress"
          updatedTasks[currentIndex + 1].executionTime = 0.0
        }

        const completionEvent = new CustomEvent("ai-task-update", {
          detail: {
            tasks: updatedTasks,
            completed: currentIndex + 1 >= updatedTasks.length,
            conversationId,
            title: conversationTitle,
            messageId,
            messageContent,
            isNewMessage: false,
            taskGroupId,
          },
        })
        document.dispatchEvent(completionEvent)

        setTimeout(
          () => {
            processTasksSequentially(
              updatedTasks,
              currentIndex + 1,
              conversationId,
              conversationTitle,
              messageId,
              messageContent,
              taskGroupId,
            )
          },
          500 + Math.random() * 1000,
        )
      }
    }, 100)
  }

  // Update the handleSendMessage function to accept an optional message parameter
  const handleSendMessage = (messageText?: string) => {
    const messageContent = messageText || input
    if (!messageContent.trim() || !currentChat) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    // Increment message count for the current chat
    const messageCount = (currentChat.messageCount || 0) + 1

    const updatedChat = {
      ...currentChat,
      lastMessage: messageContent,
      timestamp: new Date(),
      messageCount: messageCount,
      messages: [...currentChat.messages, userMessage],
    }

    setCurrentChat(updatedChat)

    // Update chat in history
    const updatedHistory = chatHistory.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))

    setChatHistory(updatedHistory)

    // 清空输入框
    setInput("")

    // Start task simulation for this message
    simulateTaskExecution(currentChat.id, currentChat.title, userMessage.id, messageCount, messageContent)

    // Simulate AI response
    setTimeout(() => {
      let aiResponse =
        "我已收到您的问题，正在分析相关内容。根据药品字典需求规格说明书，这个问题涉及到系统的业务领域和功能范围。您可以在第二章业务领域说明中找到更详细的信息。还有其他问题吗？"

      // 如果是空项目，给出不同的回复
      if (isEmptyProject) {
        if (messageCount >= 3) {
          aiResponse =
            '感谢您提供的详细信息。我已经收集了足够的需求内容，现在可以为您生成需求规格说明书了。请点击下方的"生成需求规格说明书"按钮开始生成。'
          setReadyToGenerate(true)
        } else {
          aiResponse =
            "谢谢您的信息。为了生成更完整的需求规格说明书，请继续描述您的项目需求。例如，您可以告诉我项目的功能需求、用户角色、业务流程等更多细节，这样我能更好地理解您的需求并生成更准确的文档。"
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      }

      setCurrentChat(finalChat)

      // Update chat in history again
      const finalHistory = updatedHistory.map((chat) => (chat.id === updatedChat.id ? finalChat : chat))

      setChatHistory(finalHistory)
    }, 8000)
  }

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat)
    setActiveTab("chat")
  }

  const handleAtButtonClick = () => {
    if (atButtonRef.current) {
      const rect = atButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      })
      setShowFileDropdown(true)
      setFileSearchTerm("")
    }
  }

  const handleSelectFile = (file: File) => {
    if (!currentChat) return

    // Insert file reference at cursor position or at the end
    const fileReference = `@${file.name}`

    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0
      const textBefore = input.substring(0, cursorPosition)
      const textAfter = input.substring(cursorPosition)

      setInput(textBefore + fileReference + textAfter)

      // Focus back on input and set cursor position after the inserted reference
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          const newPosition = cursorPosition + fileReference.length
          inputRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    } else {
      setInput((prev) => (prev ? `${prev} ${fileReference}` : fileReference))
    }

    setShowFileDropdown(false)
  }

  const filteredHistory = searchTerm
    ? chatHistory.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : chatHistory

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 1000 * 60 * 60) {
      // Less than an hour ago
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    } else if (diff < 1000 * 60 * 60 * 24) {
      // Less than a day ago
      const hours = Math.floor(diff / (1000 * 60 * 60))
      return `${hours}小时前`
    } else {
      // More than a day ago
      return date.toLocaleDateString()
    }
  }

  return (
    <Card className="w-[400px] shadow-lg flex flex-col h-[500px] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{isEmptyProject ? "需求输入" : "AI对话"}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {activeTab === "chat" && currentChat && (
          <div className="p-3 space-y-4">
            {currentChat.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {currentChatTasks.length > 0 && (
              <div className="px-3 py-2">
                <div className="bg-gray-50 rounded-md border">
                  <div className="p-2 border-b">
                    <h4 className="text-xs font-medium text-gray-700">任务执行状态</h4>
                  </div>
                  <div className="p-2">
                    <TaskStatus
                      taskGroups={currentChatTasks}
                      collapsedMode={true}
                      maxVisibleTasks={2}
                      expandedGroups={expandedTaskGroups}
                      onToggleGroup={toggleTaskGroup}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="divide-y">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{chat.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{chat.lastMessage}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(chat.timestamp)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>没有找到对话历史</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className="divide-y">
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>没有找到文件</p>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {activeTab === "chat" && (
        <div className="p-3 border-t">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full p-2 pl-3 pr-10 text-sm border rounded-md"
                placeholder={isEmptyProject ? "输入您的项目需求..." : "输入消息..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button
                  ref={atButtonRef}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={handleAtButtonClick}
                >
                  <AtSign className="h-4 w-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex items-center">
                  <span className="mr-1">Agent</span>
                  <span className="bg-gray-200 text-gray-600 text-[10px] px-1 rounded">x1</span>
                </span>
                <span className="text-xs text-gray-500 ml-2">gpt-4o</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className={`bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 h-7 ${!input.trim() ? "opacity-50" : ""}`}
              >
                <Send className="h-3 w-3 mr-1" />
                发送
              </Button>
            </div>

            {isEmptyProject && readyToGenerate && (
              <Button className="mt-2 bg-green-600 hover:bg-green-700" onClick={onGenerateDocument}>
                <FileOutput className="h-4 w-4 mr-2" />
                生成需求规格说明书
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Action buttons for history and files tabs */}
      {activeTab === "history" && (
        <div className="p-3 border-t">
          <Button onClick={handleNewChat} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            新建对话
          </Button>
        </div>
      )}

      {activeTab === "files" && (
        <div className="p-3 border-t">
          <Button onClick={() => setActiveTab("chat")} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            返回对话
          </Button>
        </div>
      )}

      {/* File selection dropdown */}
      <FileSelectionDropdown
        isOpen={showFileDropdown}
        onClose={() => setShowFileDropdown(false)}
        onSelectFile={handleSelectFile}
        searchTerm={fileSearchTerm}
        onSearchChange={setFileSearchTerm}
        position={dropdownPosition}
      />
    </Card>
  )
}
