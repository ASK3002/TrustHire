'use client'

import { AlertTriangle, AlertCircle } from 'lucide-react'

interface FlagsPanelProps {
  flags?: string[] | string
}

export function FlagsPanel({ flags }: FlagsPanelProps) {
  let flagArray = flags
  if (typeof flags === 'string') {
    try {
      flagArray = JSON.parse(flags)
    } catch {
      flagArray = []
    }
  }
  
  if (!Array.isArray(flagArray)) {
    flagArray = []
  }

  if (!flagArray || flagArray.length === 0) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">No red flags detected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Red Flags Detected ({flagArray.length})
      </h3>
      <div className="space-y-2">
        {flagArray.map((flag, idx) => (
          <div
            key={idx}
            className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm"
          >
            {flag}
          </div>
        ))}
      </div>
    </div>
  )
}
