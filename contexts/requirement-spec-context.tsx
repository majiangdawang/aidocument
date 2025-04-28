"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { useProject } from "./project-context"
import { API_BASE_URL } from "@/lib/config"

export interface RequirementSpec {
  id: string
  projectId: string
  version: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface RequirementSpecContextType {
  specs: RequirementSpec[]
  currentSpec: RequirementSpec | null
  isLoading: boolean
  specsCount: number
  specVersions: Array<{
    id: string
    version: string
    contentLength: number
    createdAt: Date
    updatedAt: Date
  }>
  fetchSpecsCount: (projectId: string) => Promise<number>
  fetchSpecByVersion: (projectId: string, version: string) => Promise<RequirementSpec | null>
  fetchLatestSpec: (projectId: string) => Promise<RequirementSpec | null>
  createSpec: (projectId: string, content: string) => Promise<RequirementSpec>
  updateSpec: (projectId: string, version: string, content: string) => Promise<RequirementSpec>
  deleteSpec: (projectId: string, version: string) => Promise<void>
  fetchSpecVersions: (projectId: string) => Promise<void>
}

const RequirementSpecContext = createContext<RequirementSpecContextType | undefined>(undefined)

export function RequirementSpecProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { currentProject } = useProject()
  const [specs, setSpecs] = useState<RequirementSpec[]>([])
  const [currentSpec, setCurrentSpec] = useState<RequirementSpec | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [specsCount, setSpecsCount] = useState(0)
  const [specVersions, setSpecVersions] = useState<
    Array<{
      id: string
      version: string
      contentLength?: number
      createdAt: Date
      updatedAt: Date
    }>
  >([])

  // 当项目变更时，获取该项目的规格说明书数量
  useEffect(() => {
    if (currentProject) {
      fetchSpecsCount(currentProject.id)
        .then((count) => {
          setSpecsCount(count)
          if (count > 0) {
            return fetchLatestSpec(currentProject.id)
          }
          return null
        })
        .then((spec) => {
          if (spec) {
            setCurrentSpec(spec)
          } else {
            setCurrentSpec(null)
          }
        })
        .catch((error) => {
          console.error("获取需求规格说明书信息失败:", error)
        })
    }
  }, [currentProject])

  // 获取需求规格说明书数量
  const fetchSpecsCount = async (projectId: string): Promise<number> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSpecsCount(result.data.count)
        return result.data.count
      } else {
        console.error("获取需求规格说明书数量失败:", result.message || "未知错误")
        return 0
      }
    } catch (err) {
      console.error("获取需求规格说明书数量时出错:", err)
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  // 获取特定版本的需求规格说明书
  const fetchSpecByVersion = async (projectId: string, version: string): Promise<RequirementSpec | null> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs/${version}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const specData = result.data
        const spec: RequirementSpec = {
          id: specData._id,
          projectId: specData.projectId,
          version: specData.version,
          content: specData.content,
          createdAt: new Date(specData.createdAt),
          updatedAt: new Date(specData.updatedAt),
        }
        return spec
      } else {
        console.error("获取需求规格说明书失败:", result.message || "未知错误")
        return null
      }
    } catch (err) {
      console.error("获取需求规格说明书时出错:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 获取最新版本的需求规格说明书
  const fetchLatestSpec = async (projectId: string): Promise<RequirementSpec | null> => {
    // 先获取数量
    const count = await fetchSpecsCount(projectId)
    if (count <= 0) {
      return null
    }

    // 假设版本号是从0开始递增的，最新版本就是 count-1
    const latestVersion = (count - 1).toString()
    return fetchSpecByVersion(projectId, latestVersion)
  }

  // 创建需求规格说明书
  const createSpec = async (projectId: string, content: string): Promise<RequirementSpec> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      // 获取当前版本号
      const count = await fetchSpecsCount(projectId)
      const version = count.toString()

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          version,
          content,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const specData = result.data
        const newSpec: RequirementSpec = {
          id: specData._id,
          projectId: specData.projectId,
          version: specData.version,
          content: specData.content,
          createdAt: new Date(specData.createdAt),
          updatedAt: new Date(specData.updatedAt),
        }

        setSpecs((prevSpecs) => [...prevSpecs, newSpec])
        setCurrentSpec(newSpec)
        setSpecsCount((prev) => prev + 1)

        return newSpec
      } else {
        const errorMessage = result.message || "创建需求规格说明书失败"
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("创建需求规格说明书时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 更新需求规格说明书
  const updateSpec = async (projectId: string, version: string, content: string): Promise<RequirementSpec> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs/${version}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const specData = result.data
        const updatedSpec: RequirementSpec = {
          id: specData._id,
          projectId: specData.projectId,
          version: specData.version,
          content: specData.content,
          createdAt: new Date(specData.createdAt),
          updatedAt: new Date(specData.updatedAt),
        }

        setSpecs((prevSpecs) =>
          prevSpecs.map((spec) => (spec.version === version && spec.projectId === projectId ? updatedSpec : spec)),
        )

        if (currentSpec?.version === version && currentSpec?.projectId === projectId) {
          setCurrentSpec(updatedSpec)
        }

        return updatedSpec
      } else {
        const errorMessage = result.message || "更新需求规格说明书失败"
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("更新需求规格说明书时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 删除需求规格说明书
  const deleteSpec = async (projectId: string, version: string): Promise<void> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs/${version}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSpecs((prevSpecs) => prevSpecs.filter((spec) => !(spec.version === version && spec.projectId === projectId)))

        if (currentSpec?.version === version && currentSpec?.projectId === projectId) {
          // 如果删除的是当前规格说明书，则尝试获取最新的
          const latestSpec = await fetchLatestSpec(projectId)
          setCurrentSpec(latestSpec)
        }

        // 更新计数
        setSpecsCount((prev) => Math.max(0, prev - 1))
      } else {
        const errorMessage = result.message || "删除需求规格说明书失败"
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("删除需求规格说明书时出错:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 获取需求规格说明书版本列表
  const fetchSpecVersions = async (projectId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("未授权，请重新登录")
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/requirement-specs/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const versions = result.data.map((item: any) => ({
          id: item._id,
          version: item.version,
          contentLength: item.contentLength,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))

        // 按版本号排序（假设版本号是数字）
        versions.sort((a: any, b: any) => {
          // 尝试将版本号转换为数字进行比较
          const versionA = Number.parseFloat(a.version)
          const versionB = Number.parseFloat(b.version)

          // 如果都能转换为数字，则按数字排序
          if (!isNaN(versionA) && !isNaN(versionB)) {
            return versionB - versionA // 降序排列，最新版本在前
          }

          // 如果不能转换为数字，则按字符串比较
          return b.version.localeCompare(a.version)
        })

        setSpecVersions(versions)
      } else {
        console.error("获取需求规格说明书版本列表失败:", result.message || "未知错误")
      }
    } catch (err) {
      console.error("获取需求规格说明书版本列表时出错:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // 在 currentProject 更新时，获取版本列表
  useEffect(() => {
    if (currentProject) {
      fetchSpecVersions(currentProject.id)
    }
  }, [currentProject])

  return (
    <RequirementSpecContext.Provider
      value={{
        specs,
        currentSpec,
        isLoading,
        specsCount,
        fetchSpecsCount,
        fetchSpecByVersion,
        fetchLatestSpec,
        createSpec,
        updateSpec,
        deleteSpec,
        specVersions,
        fetchSpecVersions,
      }}
    >
      {children}
    </RequirementSpecContext.Provider>
  )
}

export function useRequirementSpec() {
  const context = useContext(RequirementSpecContext)
  if (context === undefined) {
    throw new Error("useRequirementSpec must be used within a RequirementSpecProvider")
  }
  return context
}
