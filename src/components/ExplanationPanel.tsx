'use client'

import { MessageSquare } from 'lucide-react'

interface ExplanationPanelProps {
  explanation?: string
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Analysis Explanation
      </h3>
      <div className="text-gray-700 text-sm leading-relaxed space-y-2">
        {explanation?.split('\n').map((line, idx) => (
          line.trim() && (
            <p key={idx}>{line}</p>
          )
        ))}
      </div>
    </div>
  )
}
