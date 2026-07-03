'use client'

import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface TrustScoreCardProps {
  score?: number
  trust_score?: number
  verdict?: string
}

export function TrustScoreCard({ score, trust_score, verdict }: TrustScoreCardProps) {
  const rawScore = score ?? trust_score
  let numScore = Number(rawScore)

  if (!Number.isFinite(numScore)) {
    console.warn("Invalid score received:", rawScore)
    numScore = 0
  }

  const validScore = Math.min(100, Math.max(0, numScore))

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Trusted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: CheckCircle2,
        }
      case 'Suspicious':
      case 'Acceptable':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: AlertCircle,
        }
      case 'High Risk':
      case 'Needs Review':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: XCircle,
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: AlertCircle,
        }
    }
  }

  const verdictStyle = getVerdictColor(verdict || 'Unknown')
  const VerdictIcon = verdictStyle.icon

  return (
    <div className={`${verdictStyle.bg} border-2 ${verdictStyle.border} rounded-xl p-8 max-w-md mx-auto`}>
      <div className="flex items-center gap-4 mb-4">
        <VerdictIcon className={`w-8 h-8 ${verdictStyle.text}`} />
        <h2 className={`text-2xl font-bold ${verdictStyle.text}`}>
          {verdict || 'Unknown'}
        </h2>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-700">
          {Math.round(validScore)}
          <span className="text-2xl text-gray-500">/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {verdict === 'Trusted'
            ? '✅ Candidate appears genuine and consistent'
            : verdict === 'Acceptable' || verdict === 'Suspicious'
              ? '⚠️ Some inconsistencies detected - verify before proceeding'
              : verdict === 'High Risk' || verdict === 'Needs Review'
                ? '❌ Multiple red flags - do not proceed without investigation'
                : 'ℹ️ No verdict available'}
        </p>
      </div>
    </div>
  )
}
