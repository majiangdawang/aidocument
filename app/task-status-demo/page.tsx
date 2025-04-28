"use client"

import { useState, useEffect } from "react"
import { TaskStatus, type Task } from "@/components/task-status"

export default function TaskStatusDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "分析业务场景需求",
      status: "completed",
      executionTime: 5.0,
    },
    {
      id: "2",
      name: "使用Next.js搭建项目基础框架",
      status: "completed",
      executionTime: 7.0,
    },
    {
      id: "3",
      name: "设计用户交互界面",
      status: "completed",
      executionTime: 5.0,
    },
    {
      id: "4",
      name: "实现文件上传功能",
      status: "in-progress",
      executionTime: 0.0,
    },
    {
      id: "5",
      name: "开发文档处理模块",
      status: "pending",
    },
    {
      id: "6",
      name: "开发业务场景提取算法",
      status: "pending",
    },
    {
      id: "7",
      name: "添加交互式功能特性",
      status: "pending",
    },
    {
      id: "8",
      name: "进行网站测试和部署",
      status: "pending",
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

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">任务执行状态</h1>
      <TaskStatus tasks={tasks} />
    </div>
  )
}
