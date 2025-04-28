"use client"

import { useCallback, useEffect, type RefObject } from "react"

export function useDocumentNavigation(containerRef: RefObject<HTMLElement>) {
  // 导航到指定章节的函数
  const navigateToSection = useCallback(
    (sectionId: string) => {
      if (!containerRef.current) return

      // 查找 ProseMirror 编辑器元素
      const editorElement = containerRef.current.querySelector(".ProseMirror")
      if (!editorElement) {
        console.error("ProseMirror element not found")
        return
      }

      // 查找具有匹配 data-section-id 的标题
      const targetHeading = editorElement.querySelector(`[data-section-id="${sectionId}"]`)

      if (targetHeading) {
        // 滚动到标题
        targetHeading.scrollIntoView({ behavior: "smooth", block: "start" })

        // 添加高亮效果以显示我们导航到的位置
        targetHeading.classList.add("bg-yellow-100")
        setTimeout(() => {
          targetHeading.classList.remove("bg-yellow-100")
        }, 2000)
      } else {
        console.error(`Section not found: ${sectionId}`)
      }
    },
    [containerRef],
  )

  // 监听导航事件
  useEffect(() => {
    const handleNavigateToSection = (event: Event) => {
      const customEvent = event as CustomEvent
      const sectionId = customEvent.detail.sectionId
      navigateToSection(sectionId)
    }

    document.addEventListener("navigate-to-section", handleNavigateToSection)

    return () => {
      document.removeEventListener("navigate-to-section", handleNavigateToSection)
    }
  }, [navigateToSection])

  return { navigateToSection }
}
