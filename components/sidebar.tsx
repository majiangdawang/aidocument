"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, FileText, BookOpen, List, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskStatus, type Task } from "@/components/task-status"
// 导入 OutlineItem 接口
import type { OutlineItem } from "@/components/tiptap-editor"

// 更新 SidebarProps 接口
interface SidebarProps {
  onNavigate?: (sectionId: string) => void
  outline?: OutlineItem[] // 添加这一行
  activeSection?: string
  onSectionClick?: (sectionId: string) => void
}

// Define the conversation task group interface
interface ConversationTaskGroup {
  conversationId: string
  title: string
  timestamp: Date
  tasks: Task[]
  taskGroupId?: string // 添加任务组ID
}

// 在 Sidebar 组件中使用 outline 属性
export function Sidebar({ onNavigate, outline = [], activeSection, onSectionClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Update state to store task groups instead of just tasks
  const [taskGroups, setTaskGroups] = useState<ConversationTaskGroup[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [collapseTasks, setCollapseTasks] = useState(false)

  // Timer ref for auto-collapsing tasks
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Add a state to track the most recent conversation ID
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [mostRecentTaskGroupId, setMostRecentTaskGroupId] = useState<string | null>(null)

  // Update the effect to handle automatic expansion/collapsing
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const { tasks, conversationId, title, completed, messageId, messageContent, isNewMessage, taskGroupId } =
        event.detail

      // Update task groups
      setTaskGroups((prevGroups) => {
        // 如果是新消息，检查是否已存在相同的任务组ID
        if (isNewMessage) {
          // 查找是否已存在相同的任务组ID
          const existingGroupIndex = prevGroups.findIndex((g) => g.taskGroupId === taskGroupId)

          if (existingGroupIndex >= 0) {
            // 如果已存在相同的任务组ID，更新任务
            const updatedGroups = [...prevGroups]
            const existingGroup = { ...updatedGroups[existingGroupIndex] }

            // 更新任务
            existingGroup.tasks = tasks
            existingGroup.timestamp = new Date()

            // 更新组
            updatedGroups[existingGroupIndex] = existingGroup

            // 设置最近的任务组ID
            if (taskGroupId !== mostRecentTaskGroupId) {
              setMostRecentTaskGroupId(taskGroupId)

              // 展开这个任务组，折叠其他任务组
              setExpandedGroups((prev) => {
                const newState = { ...prev }

                // 折叠所有其他任务组
                Object.keys(newState).forEach((id) => {
                  newState[id] = false
                })

                // 展开这个任务组
                newState[taskGroupId] = true

                return newState
              })
            }

            return updatedGroups
          } else {
            // 如果不存在相同的任务组ID，创建新的任务组
            const newGroup: ConversationTaskGroup = {
              conversationId,
              title: title || messageContent || `对话 ${prevGroups.length + 1}`,
              timestamp: new Date(),
              tasks,
              taskGroupId,
            }

            // 添加新任务组到数组开头
            const updatedGroups = [newGroup, ...prevGroups]

            // 设置最近的任务组ID
            setMostRecentTaskGroupId(taskGroupId)

            // 展开这个任务组，折叠其他任务组
            setExpandedGroups((prev) => {
              const newState = { ...prev }

              // 折叠所有其他任务组
              Object.keys(newState).forEach((id) => {
                newState[id] = false
              })

              // 展开这个任务组
              newState[taskGroupId] = true

              return newState
            })

            return updatedGroups
          }
        } else {
          // 如果不是新消息，更新现有任务
          const existingGroupIndex = prevGroups.findIndex((g) => g.taskGroupId === taskGroupId)

          if (existingGroupIndex >= 0) {
            // 更新现有任务组
            const updatedGroups = [...prevGroups]
            const existingGroup = { ...updatedGroups[existingGroupIndex] }

            // 更新任务
            const updatedTasks = [...existingGroup.tasks]

            // 对于事件中的每个任务
            tasks.forEach((updatedTask) => {
              // 在现有任务中查找匹配的任务
              const taskIndex = updatedTasks.findIndex((t) => t.id === updatedTask.id)

              if (taskIndex >= 0) {
                // 更新现有任务
                updatedTasks[taskIndex] = updatedTask
              }
            })

            existingGroup.tasks = updatedTasks
            existingGroup.timestamp = new Date()

            // 更新组
            updatedGroups[existingGroupIndex] = existingGroup

            return updatedGroups
          }

          return prevGroups
        }
      })

      setShowTasks(true)
    }

    // Listen for custom event
    document.addEventListener("ai-task-update", handleTaskUpdate as EventListener)

    return () => {
      document.removeEventListener("ai-task-update", handleTaskUpdate as EventListener)
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current)
      }
    }
  }, [mostRecentTaskGroupId])

  // Add a function to toggle a specific task group
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // 递归渲染大纲项目的函数
  const renderOutlineItems = (items: OutlineItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id} className="mb-1">
        <button
          className={`text-left w-full px-2 py-1 rounded hover:bg-gray-100 ${
            activeSection === item.id ? "bg-gray-100 font-medium" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onSectionClick && onSectionClick(item.id)}
        >
          {item.title}
        </button>
        {item.children.length > 0 && <div className="ml-2">{renderOutlineItems(item.children, depth + 1)}</div>}
      </div>
    ))
  }

  // 在 return 语句中修改目录部分
  return (
    <div
      className={`border-r flex flex-col h-full overflow-auto transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className={`p-4 border-b flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && <span className="font-medium">需求大纲</span>}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-4 space-y-6">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100" title="文档大纲">
            <BookOpen className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100" title="需求列表">
            <List className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100" title="文档资源">
            <FileText className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100" title="设置">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="font-medium mb-2">药品字典需求规格说明书</h3>
            <nav className="space-y-1 text-sm">
              {outline && outline.length > 0 ? (
                renderOutlineItems(outline)
              ) : (
                // 如果没有大纲数据，显示默认的静态目录
                <div className="pl-4">
                  <div
                    className="text-blue-600 py-1 cursor-pointer hover:underline"
                    onClick={() => onNavigate && onNavigate("chapter-1")}
                  >
                    第一章 概述
                  </div>
                  <div className="pl-4 space-y-1">
                    <div
                      className="py-1 cursor-pointer hover:text-blue-600"
                      onClick={() => onNavigate && onNavigate("section-1-1")}
                    >
                      1.1 编写目的
                    </div>
                    <div
                      className="py-1 cursor-pointer hover:text-blue-600"
                      onClick={() => onNavigate && onNavigate("section-1-2")}
                    >
                      1.2 需求背景
                    </div>
                    <div
                      className="py-1 cursor-pointer hover:text-blue-600"
                      onClick={() => onNavigate && onNavigate("section-1-3")}
                    >
                      1.3 可行性分析
                    </div>
                    <div
                      className="py-1 cursor-pointer hover:text-blue-600"
                      onClick={() => onNavigate && onNavigate("section-1-4")}
                    >
                      1.4 业务影响范围
                    </div>
                    <div
                      className="py-1 cursor-pointer hover:text-blue-600"
                      onClick={() => onNavigate && onNavigate("section-1-5")}
                    >
                      1.5 术语定义
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      <div className={`border-t p-2 flex flex-col ${isCollapsed ? "items-center" : ""}`}>
        {showTasks ? (
          <div className={`w-full ${isCollapsed ? "hidden" : "block"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">任务执行状态</span>
              {taskGroups.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs py-0 px-2"
                  onClick={() => setCollapseTasks(!collapseTasks)}
                >
                  {collapseTasks ? "展开" : "折叠"}
                </Button>
              )}
            </div>
            <TaskStatus
              taskGroups={taskGroups}
              collapsedMode={collapseTasks}
              maxVisibleTasks={3}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroupExpansion}
            />
          </div>
        ) : (
          <div className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed ? (
              <>
                <span className="text-xs text-gray-500">日志</span>
                <span className="text-xs text-gray-500">执行状态</span>
              </>
            ) : (
              <div className="h-2 w-2 rounded-full bg-green-500" title="系统状态正常"></div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
