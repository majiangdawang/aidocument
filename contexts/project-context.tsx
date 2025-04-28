"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
// 在顶部导入配置
import { API_BASE_URL } from "@/lib/config"

export interface Project {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  createProject: (name: string, description: string) => Promise<Project>
  selectProject: (projectId: string) => void
  updateProject: (projectId: string, data: Partial<Project>) => Promise<Project>
  deleteProject: (projectId: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 加载用户的项目
  useEffect(() => {
    if (user) {
      fetchProjects()
    } else {
      setProjects([])
      setCurrentProject(null)
      setIsLoading(false)
    }
  }, [user])

  // 从本地存储加载当前项目
  useEffect(() => {
    if (user) {
      const storedCurrentProjectId = localStorage.getItem(`currentProject-${user.id}`)
      if (storedCurrentProjectId && projects.length > 0) {
        const project = projects.find((p) => p.id === storedCurrentProjectId)
        if (project) {
          setCurrentProject(project)
        } else {
          setCurrentProject(projects[0])
          localStorage.setItem(`currentProject-${user.id}`, projects[0].id)
        }
      } else if (projects.length > 0) {
        setCurrentProject(projects[0])
        localStorage.setItem(`currentProject-${user.id}`, projects[0].id)
      }
    }
  }, [user, projects])

  // 获取项目列表
  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        // 处理新的响应结构
        const projectsData = result.success ? result.data : result

        // 确保projectsData是数组
        const projectsArray = Array.isArray(projectsData) ? projectsData : [projectsData]

        // 将API返回的项目数据映射到我们的Project接口
        const fetchedProjects = projectsArray.map((project: any) => ({
          id: project._id,
          name: project.name,
          description: project.description || "",
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          ownerId: project.owner,
        }))

        setProjects(fetchedProjects)
      } else {
        console.error("获取项目列表失败:", result.message || (result.error ? result.error : "未知错误"))
      }
    } catch (err) {
      console.error("获取项目列表时出错:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // 创建项目
  const createProject = async (name: string, description: string): Promise<Project> => {
    if (!user) throw new Error("User must be logged in to create a project")

    setIsLoading(true)
    try {
      // 获取令牌
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      // 调用API创建项目
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      })

      const result = await response.json()

      if (response.ok) {
        // 处理新的响应结构
        const projectData = result.success ? result.data : result

        const newProject: Project = {
          id: projectData._id,
          name: projectData.name,
          description: projectData.description || "",
          createdAt: new Date(projectData.createdAt),
          updatedAt: new Date(projectData.updatedAt),
          ownerId: projectData.owner,
        }

        // 更新项目列表
        setProjects((prevProjects) => [...prevProjects, newProject])

        return newProject
      } else {
        const errorMessage = result.message || (result.error ? result.error : "创建项目失败")
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("创建项目时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const selectProject = (projectId: string) => {
    if (!user) return

    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      localStorage.setItem(`currentProject-${user.id}`, projectId)
    }
  }

  const updateProject = async (projectId: string, data: Partial<Project>): Promise<Project> => {
    if (!user) throw new Error("User must be logged in to update a project")

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // 处理新的响应结构
        const projectData = result.success ? result.data : result

        const updatedProject: Project = {
          id: projectData._id,
          name: projectData.name,
          description: projectData.description || "",
          createdAt: new Date(projectData.createdAt),
          updatedAt: new Date(projectData.updatedAt),
          ownerId: projectData.owner,
        }

        // 更新项目列表
        setProjects((prevProjects) =>
          prevProjects.map((project) => (project.id === projectId ? updatedProject : project)),
        )

        // 如果当前项目是被更新的项目，也更新当前项目
        if (currentProject?.id === projectId) {
          setCurrentProject(updatedProject)
        }

        return updatedProject
      } else {
        const errorMessage = result.message || (result.error ? result.error : "更新项目失败")
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("更新项目时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (projectId: string): Promise<void> => {
    if (!user) throw new Error("User must be logged in to delete a project")

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        // 从项目列表中移除被删除的项目
        const updatedProjects = projects.filter((project) => project.id !== projectId)
        setProjects(updatedProjects)

        // 如果当前项目是被删除的项目，重置当前项目
        if (currentProject?.id === projectId) {
          if (updatedProjects.length > 0) {
            setCurrentProject(updatedProjects[0])
            localStorage.setItem(`currentProject-${user.id}`, updatedProjects[0].id)
          } else {
            setCurrentProject(null)
            localStorage.removeItem(`currentProject-${user.id}`)
          }
        }
      } else {
        const errorMessage = result.message || (result.error ? result.error : "删除项目失败")
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("删除项目时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        isLoading,
        createProject,
        selectProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
