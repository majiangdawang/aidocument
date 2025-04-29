"use client"

import { useState, useEffect } from "react"
// 确保 TaskStatus 和 Task 类型从同一个地方导入
import { TaskStatus, type Task, type ConversationTaskGroup } from "@/components/task-status"

export default function TaskStatusDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "分析业务场景需求",
      status: "completed",
      executionTime: 5.0,
      conversationId: "conv-1", // 添加 conversationId
      messageId: "msg-1",
      messageContent: "需求分析完成",
    },
    {
      id: "2",
      name: "使用Next.js搭建项目基础框架",
      status: "completed",
      executionTime: 7.0,
      conversationId: "conv-1", // 添加 conversationId
      messageId: "msg-2",
      messageContent: "框架搭建完成",
    },
    {
      id: "3",
      name: "设计用户交互界面",
      status: "completed",
      executionTime: 5.0,
      conversationId: "conv-1", // 添加 conversationId
      messageId: "msg-3",
      messageContent: "UI设计完成",
    },
    {
      id: "4",
      name: "实现文件上传功能",
      status: "in-progress",
      executionTime: 0.0,
      conversationId: "conv-1", // 添加 conversationId
      messageId: "msg-4",
      messageContent: "文件上传中...",
    },
    {
      id: "5",
      name: "开发文档处理模块",
      status: "pending",
      conversationId: "conv-2", // 另一个对话组
      messageId: "msg-5",
      messageContent: "等待处理模块开发",
    },
    {
      id: "6",
      name: "开发业务场景提取算法",
      status: "pending",
      conversationId: "conv-2", // 另一个对话组
      messageId: "msg-6",
      messageContent: "等待算法开发",
    },
    {
      id: "7",
      name: "添加交互式功能特性",
      status: "pending",
      conversationId: "conv-3", // 第三个对话组
      messageId: "msg-7",
      messageContent: "等待交互特性",
    },
    {
      id: "8",
      name: "进行网站测试和部署",
      status: "pending",
      conversationId: "conv-3", // 第三个对话组
      messageId: "msg-8",
      messageContent: "等待测试部署",
    },
  ])

  // Simulate progress for the in-progress task
  useEffect(() => {
    const inProgressTask = tasks.find((task) => task.status === "in-progress")
    if (inProgressTask) {
      const interval = setInterval(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === inProgressTask.id ? { ...task, executionTime: (task.executionTime || 0) + 0.1 } : task,
          ),
        )
      }, 100)

      return () => clearInterval(interval)
    }
  }, [tasks])

  // 将 tasks 数组转换为 ConversationTaskGroup 数组
  const taskGroups: ConversationTaskGroup[] = Object.values(
    tasks.reduce((acc, task) => {
      const conversationId = task.conversationId || 'default'; // 如果没有 conversationId，使用 default
      if (!acc[conversationId]) {
        acc[conversationId] = {
          conversationId: conversationId,
          title: `对话组 ${conversationId}`, // 根据实际情况生成标题
          timestamp: new Date(), // 或者使用第一个任务的时间戳
          tasks: [],
          taskGroupId: conversationId, // 使用 conversationId 作为 taskGroupId
        };
      }
      acc[conversationId].tasks.push(task);
      return acc;
    }, {} as Record<string, ConversationTaskGroup>)
  );


  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">任务执行状态</h1>
      {/* 将转换后的 taskGroups 传递给 TaskStatus 组件 */}
      <TaskStatus taskGroups={taskGroups} />
    </div>
  )
}
