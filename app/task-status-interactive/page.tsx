"use client"

import { useState } from "react"
import { TaskStatus, type Task } from "@/components/task-status"
import { Button } from "@/components/ui/button"

export default function TaskStatusInteractive() {
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

  const startNextTask = () => {
    const pendingTasks = tasks.filter((task) => task.status === "pending")
    if (pendingTasks.length > 0) {
      const nextTask = pendingTasks[0]
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === nextTask.id ? { ...task, status: "in-progress" as const, executionTime: 0.0 } : task,
        ),
      )
    }
  }

  const completeCurrentTask = () => {
    const inProgressTask = tasks.find((task) => task.status === "in-progress")
    if (inProgressTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === inProgressTask.id ? { ...task, status: "completed" as const } : task)),
      )
    }
  }

  const resetTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) => ({
        ...task,
        status: index < 3 ? ("completed" as const) : index === 3 ? ("in-progress" as const) : ("pending" as const),
        executionTime: index < 3 ? task.executionTime : index === 3 ? 0.0 : undefined,
      })),
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">任务执行状态</h1>
      <TaskStatus tasks={tasks} />

      <div className="mt-6 flex gap-3">
        <Button onClick={startNextTask} disabled={!tasks.every((task) => task.status !== "in-progress")}>
          开始下一个任务
        </Button>
        <Button onClick={completeCurrentTask} disabled={!tasks.some((task) => task.status === "in-progress")}>
          完成当前任务
        </Button>
        <Button variant="outline" onClick={resetTasks}>
          重置
        </Button>
      </div>
    </div>
  )
}
