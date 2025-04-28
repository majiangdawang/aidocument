"use client"

interface CitationButtonProps {
  number: number
  onClick: () => void
}

export function CitationButton({ number, onClick }: CitationButtonProps) {
  return (
    <button
      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium cursor-pointer"
      onClick={onClick}
    >
      {number}
    </button>
  )
}
