'use client'

interface BreakdownBarProps {
  label: string
  score: number
}

export function BreakdownBar({ label, score }: BreakdownBarProps) {
  const getColor = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-600">
          {Math.round(score)}/100
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
