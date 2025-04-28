"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const { register, isLoading, error: authError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("请填写所有字段")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("两次输入的密码不一致")
      return
    }

    try {
      await register(name, email, password)
      router.push("/projects")
    } catch (err) {
      // 错误已在AuthContext中处理
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-10 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI文档助手</h1>
          <p className="text-indigo-100">智能文档管理与分析平台</p>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-6">加入我们，开启智能文档之旅</h2>
            <p className="text-indigo-100 mb-8">
              AI文档助手帮助您更高效地管理和分析文档，提供智能分析、协作编辑和AI辅助写作等功能，让您的工作更轻松。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium mb-1">智能分析</h3>
                <p className="text-xs text-indigo-100">自动提取关键信息，快速理解文档内容</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium mb-1">协作编辑</h3>
                <p className="text-xs text-indigo-100">多人实时协作，提高团队工作效率</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium mb-1">AI辅助</h3>
                <p className="text-xs text-indigo-100">智能辅助内容创作，提升文档质量</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium mb-1">版本管理</h3>
                <p className="text-xs text-indigo-100">完整的版本历史，轻松回溯和比较</p>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-10">
          <p className="text-sm text-indigo-100">© 2023 AI文档助手. 保留所有权利.</p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">创建账户</h2>
            <p className="mt-2 text-sm text-gray-600">注册一个新账户以使用我们的服务</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1"
                  placeholder="张三"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密码
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认密码
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {localError || authError ? (
              <p className="text-sm text-center text-red-600">{localError || authError}</p>
            ) : null}

            <div>
              <Button type="submit" className="w-full flex justify-center py-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    创建账户
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                已有账户?{" "}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  立即登录
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
