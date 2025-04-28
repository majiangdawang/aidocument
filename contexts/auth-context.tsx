"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 在顶部导入配置
import { API_BASE_URL } from "@/lib/config"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          const userData = result.data || result
          setUser({
            id: userData.id || userData._id,
            name: userData.name,
            email: userData.email,
          })
        } else {
          // 令牌无效或过期
          localStorage.removeItem("token")
        }
      } catch (err) {
        console.error("验证用户会话时出错:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        // 保存令牌到本地存储
        localStorage.setItem("token", result.data?.token || result.token)

        // 设置用户信息 - 处理新的响应结构
        const userData = result.data?.user || result.user
        const user: User = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
        }

        setUser(user)
      } else {
        // 登录失败
        setError(result.message || "登录失败，请检查您的凭据")
        throw new Error(result.message || "登录失败")
      }
    } catch (err) {
      console.error("登录时出错:", err)
      setError(err instanceof Error ? err.message : "登录失败，请稍后再试")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        // 保存令牌到本地存储
        localStorage.setItem("token", result.data?.token || result.token)

        // 设置用户信息 - 处理新的响应结构
        const userData = result.data?.user || result.user
        const user: User = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
        }

        setUser(user)
      } else {
        // 注册失败
        setError(result.message || "注册失败，请稍后再试")
        throw new Error(result.message || "注册失败")
      }
    } catch (err) {
      console.error("注册时出错:", err)
      setError(err instanceof Error ? err.message : "注册失败，请稍后再试")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // 无论响应如何，都清除本地存储和用户状态
        localStorage.removeItem("token")
        setUser(null)
      }
    } catch (err) {
      console.error("登出时出错:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
