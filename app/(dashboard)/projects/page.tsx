"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Plus,
  Settings,
  Trash2,
  Search,
  Clock,
  User,
  LogOut,
  ChevronRight,
  Filter,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"

export default function ProjectsPage() {
  const { user, logout } = useAuth()
  const { projects, createProject, selectProject, deleteProject, isLoading } = useProject()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newProjectName) {
      setError("请输入项目名称")
      return
    }

    try {
      const project = await createProject(newProjectName, newProjectDescription)
      setIsCreateDialogOpen(false)
      setNewProjectName("")
      setNewProjectDescription("")
      selectProject(project.id)
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError("创建项目失败，请稍后再试")
    }
  }

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId)
    router.push(`/projects/${projectId}`)
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(projectId)
  }

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete)
        setProjectToDelete(null)
      } catch (err) {
        alert("删除项目失败，请稍后再试")
      }
    }
  }

  // Filter and sort projects
  const filteredProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else {
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

  // 获取要删除的项目名称
  const projectToDeleteName = projectToDelete ? projects.find((p) => p.id === projectToDelete)?.name || "此项目" : ""

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  AI
                </div>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">AI文档助手</h1>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                <User className="h-4 w-4 mr-1" />
                个人资料
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">我的项目</h2>
            <p className="mt-1 text-sm text-gray-500">管理您的所有文档项目</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  新建项目
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateProject}>
                  <DialogHeader>
                    <DialogTitle>创建新项目</DialogTitle>
                    <DialogDescription>填写以下信息创建一个新项目</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">项目名称</Label>
                      <Input
                        id="name"
                        placeholder="输入项目名称"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">项目描述</Label>
                      <Textarea
                        id="description"
                        placeholder="输入项目描述（可选）"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        "创建项目"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索项目..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("date")}
              className="flex-1 sm:flex-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              最近更新
            </Button>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
              className="flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4 mr-2" />
              按名称
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 新建项目卡片 - 更新样式使其与现有项目卡片风格一致 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div
                className="bg-white rounded-lg border border-dashed border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[172px] flex flex-col"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <Plus className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">新建项目</h3>
                        <p className="text-sm text-gray-500">创建一个新的需求分析项目</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>创建新项目</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600">
                      <span>创建</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 项目卡片列表 */}
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
              >
                <div
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description || "无项目描述"}</p>
                      </div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/projects/${project.id}/settings`)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          更新于{" "}
                          {project.updatedAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {project.updatedAt.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                        <span>打开</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && searchTerm && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">没有找到匹配的项目</h3>
            <p className="mt-2 text-sm text-gray-500">尝试使用不同的搜索词或清除搜索</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
              清除搜索
            </Button>
          </div>
        )}

        {/* 删除确认对话框 */}
        <Dialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                确认删除项目
              </DialogTitle>
              <DialogDescription>
                此操作将永久删除项目"{projectToDeleteName}"及其所有相关数据，无法恢复。
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-50 p-4 rounded-md border border-red-100 my-2">
              <p className="text-sm text-red-800">
                删除后，所有与此项目相关的文档、设置和协作信息将被永久移除。请确认您已备份所需的数据。
              </p>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setProjectToDelete(null)} className="mt-2 sm:mt-0">
                取消
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteProject} className="mt-2 sm:mt-0">
                <Trash2 className="h-4 w-4 mr-2" />
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
