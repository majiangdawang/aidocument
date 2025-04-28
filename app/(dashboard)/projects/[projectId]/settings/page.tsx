"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Save, Trash2, AlertTriangle, Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ProjectSettingsPage() {
  const { user } = useAuth()
  const { projects, updateProject, deleteProject, isLoading } = useProject()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setName(project.name)
        setDescription(project.description)
      } else {
        router.push("/projects")
      }
    }
  }, [projects, projectId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!name) {
      setError("请输入项目名称")
      return
    }

    setIsSaving(true)
    try {
      await updateProject(projectId, { name, description })
      setSuccessMessage("项目信息已成功更新")

      // 设置定时器，3秒后清除成功消息
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      setError("更新项目失败，请稍后再试")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId)
      router.push("/projects")
    } catch (err) {
      alert("删除项目失败，请稍后再试")
    }
  }

  const currentProject = projects.find((p) => p.id === projectId)

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${projectId}`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">项目设置</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="outline" size="sm">
                返回项目列表
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>项目信息</CardTitle>
                  <CardDescription>管理您的项目基本信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">项目名称</Label>
                      <Input
                        id="name"
                        placeholder="输入项目名称"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">项目描述</Label>
                      <Textarea
                        id="description"
                        placeholder="输入项目描述（可选）"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {successMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-500 bg-green-50 p-2 rounded-md border border-green-200"
                      >
                        {successMessage}
                      </motion.p>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading || isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {currentProject && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">危险区域</CardTitle>
                    <CardDescription>删除项目将永久移除所有相关数据，此操作无法撤销</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showDeleteConfirm ? (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">确认删除</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>您确定要删除项目 "{currentProject.name}" 吗？此操作无法撤销。</p>
                            </div>
                            <div className="mt-4 flex space-x-3">
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteProject}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                确认删除
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                取消
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500 mb-4">
                          删除项目将永久移除所有相关数据和文档。此操作无法撤销。
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除项目
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div>
            {currentProject && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>项目详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">创建日期</p>
                          <p className="text-sm text-gray-900">
                            {currentProject.createdAt.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">最后更新</p>
                          <p className="text-sm text-gray-900">
                            {currentProject.updatedAt.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">所有者</p>
                          <p className="text-sm text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
