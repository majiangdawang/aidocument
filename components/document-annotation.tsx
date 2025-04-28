"use client"

import type React from "react"

import { Card } from "@/components/ui/card"

interface AnnotationProps {
  position: {
    top: string | number
    left: string | number
    right?: string | number
    bottom?: string | number
  }
  direction: "top" | "right" | "bottom" | "left"
  children: React.ReactNode
}

export function DocumentAnnotation({ position, direction, children }: AnnotationProps) {
  return (
    <div
      className="absolute z-40"
      style={{
        top: typeof position.top === "number" ? `${position.top}px` : position.top,
        left: typeof position.left === "number" ? `${position.left}px` : position.left,
        right: position.right ? (typeof position.right === "number" ? `${position.right}px` : position.right) : "auto",
        bottom: position.bottom
          ? typeof position.bottom === "number"
            ? `${position.bottom}px`
            : position.bottom
          : "auto",
      }}
    >
      <Card className="bg-red-500 text-white p-2 text-xs max-w-xs shadow-lg">{children}</Card>
      <div
        className={`absolute w-8 h-8 border-t-2 border-r-2 border-red-500 ${
          direction === "top"
            ? "top-0 left-1/2 -translate-x-1/2 -translate-y-full rotate-45"
            : direction === "right"
              ? "top-1/2 right-0 translate-x-full -translate-y-1/2 rotate-135"
              : direction === "bottom"
                ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-full rotate-225"
                : "top-1/2 left-0 -translate-x-full -translate-y-1/2 rotate-315"
        }`}
      ></div>
    </div>
  )
}
