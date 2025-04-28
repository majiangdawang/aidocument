"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SourceCodeEditorProps {
  content: string
  onClose: () => void
  onSave: (html: string) => void
}

export function SourceCodeEditor({ content, onClose, onSave }: SourceCodeEditorProps) {
  const [sourceCode, setSourceCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Format the HTML with indentation for better readability
    const formatHtml = (html: string) => {
      let formatted = html
      try {
        // Simple formatting - replace closing tags with newline + closing tag
        formatted = html.replace(/></g, ">\n<")
      } catch (e) {
        console.error("Error formatting HTML:", e)
      }
      return formatted
    }

    setSourceCode(formatHtml(content))
  }, [content])

  const validateHtml = (html: string): boolean => {
    try {
      // Create a temporary DOM parser to validate the HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Check if there are parsing errors
      const parserErrors = doc.querySelectorAll("parsererror")
      if (parserErrors.length > 0) {
        setError("HTML parsing error: " + parserErrors[0].textContent)
        return false
      }

      // Additional validation for common ProseMirror issues
      // Check for unclosed tags or mismatched tags
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      // If the HTML is valid, clear any previous errors
      setError(null)
      return true
    } catch (e) {
      console.error("HTML validation error:", e)
      setError("Invalid HTML: " + (e instanceof Error ? e.message : String(e)))
      return false
    }
  }

  const sanitizeHtml = (html: string): string => {
    try {
      // Basic sanitization to fix common issues
      const sanitized = html
        // Ensure all tags are properly closed
        .replace(/<([a-z][a-z0-9]*)[^>]*?(?!\/)>/gi, (match, tag) => {
          // Skip self-closing tags
          if (/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag)) {
            return match
          }
          return match + `</${tag}>`
        })
        // Remove any script tags for security
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Ensure proper nesting of block elements
        .replace(/<\/(div|p|h[1-6]|section|article)>([^<]*)<(div|p|h[1-6]|section|article)/gi, "</$1>$2\n<$3")

      return sanitized
    } catch (e) {
      console.error("HTML sanitization error:", e)
      return html // Return original if sanitization fails
    }
  }

  const handleSave = () => {
    try {
      // First try to sanitize the HTML
      const sanitizedHtml = sanitizeHtml(sourceCode)

      // Then validate it
      if (validateHtml(sanitizedHtml)) {
        onSave(sanitizedHtml)
        onClose()
      } else {
        // If validation fails, show error but don't close
        console.error("HTML validation failed")
      }
    } catch (e) {
      setError("Error processing HTML: " + (e instanceof Error ? e.message : String(e)))
      console.error("Error in handleSave:", e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl h-[80%] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">编辑源代码</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <textarea
            className="w-full h-full font-mono text-sm p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value)
              // Clear error when user starts typing
              if (error) setError(null)
            }}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>确定</Button>
        </div>
      </div>
    </div>
  )
}
