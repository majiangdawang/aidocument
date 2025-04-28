"use client"

import {
  ChevronLeft,
  Settings,
  LogOut,
  Share2,
  FileText,
  Layers,
  Bell,
  Search,
  Menu,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  projectName?: string
  onShowFileList?: () => void
  onShowPrototype?: () => void
  onShowAiChat?: () => void
}

export function Header({ projectName, onShowFileList, onShowPrototype, onShowAiChat }: HeaderProps) {
  const { user, logout } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center">
              <span className="font-medium text-lg">{projectName || "文档编辑器"}</span>
              <div className="h-5 w-px bg-gray-300 mx-3"></div>
              <Link href={`/projects/${projectId}/settings`}>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">设置</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Search className="h-4 w-4 mr-1" />
              搜索
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" onClick={onShowPrototype}>
              <Layers className="h-4 w-4 mr-1" />
              产品原型
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" onClick={onShowFileList}>
              <FileText className="h-4 w-4 mr-1" />
              原始需求池
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" onClick={onShowAiChat}>
              <MessageSquare className="h-4 w-4 mr-1" />
              AI对话
            </Button>
            <div className="h-5 w-px bg-gray-300 mx-1"></div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center ml-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="ml-1">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
            >
              <div className="px-4 py-2 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500 hover:text-gray-700">
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    onShowPrototype?.()
                    setShowMobileMenu(false)
                  }}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  产品原型
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500 hover:text-gray-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    onShowFileList?.()
                    setShowMobileMenu(false)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  原始需求池
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    onShowAiChat?.()
                    setShowMobileMenu(false)
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI对话
                </Button>
                <div className="border-t my-2"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-sm font-medium">{user?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-gray-700">
                    <LogOut className="h-4 w-4 mr-1" />
                    退出
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
