"use client"
import { X } from "lucide-react"

interface EditConfirmationDialogProps {
  title: string
  onAccept: () => void
  onReject: () => void
  code?: string
}

export function EditConfirmationDialog({ title, onAccept, onReject, code }: EditConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Top dialog with red border */}
      <div className="bg-white shadow-sm border border-red-500 w-full edit-confirmation-dialog">
        <div className="flex flex-col">
          {/* Title and close button */}
          <div className="flex items-center justify-between p-2 px-3">
            <h3 className="text-sm font-medium">{title}</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={onReject} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="p-2 px-3 flex items-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center mr-2"
              onClick={onAccept}
            >
              <span className="mr-1 text-xs">⌘J</span> Accept
            </button>
            <button
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center"
              onClick={onReject}
            >
              <span className="mr-1 text-xs">⎋</span> Reject
            </button>

            <span className="text-xs text-gray-500 ml-auto">Follow-up instructions... ⌘K</span>
          </div>

          {/* Code content inside the dialog */}
          {code && (
            <div className="bg-red-50 border-t border-b border-red-500 p-2 px-3">
              <pre className="text-sm font-mono">
                <code dangerouslySetInnerHTML={{ __html: code }} />
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
