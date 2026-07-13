'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { UploadResume } from '@/components/UploadResume'
import { TrustScoreCard } from '@/components/TrustScoreCard'
import { BreakdownBar } from '@/components/BreakdownBar'
import { FlagsPanel } from '@/components/FlagsPanel'
import { ExplanationPanel } from '@/components/ExplanationPanel'
import { ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (file: File, githubUsername: string, selectedSkills: string[], codeforcesHandle: string) => {
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const uploadResponse = await fetch('/api/trust/upload-resume', {
        method: 'POST',
        body: formData,
      })
      
      const uploadData = await uploadResponse.json()
      const uploadedResumeId = uploadData.data.resumeId
      setResumeId(uploadedResumeId)
      
      const analyzeResponse = await fetch('/api/trust/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: uploadedResumeId,
          githubUsername,
          selectedSkills,
          codeforcesHandle,
        }),
      })
      
      const analyzeData = await analyzeResponse.json()
      setAnalysisResult(analyzeData.data)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setAnalysisResult(null)
    setResumeId(null)
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!analysisResult ? (
            <UploadResume onAnalyze={handleAnalyze} />
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Analyze Another Resume
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <TrustScoreCard
                    score={analysisResult.trustScore}
                    verdict={analysisResult.verdict}
                  />
                  
                  {analysisResult.breakdown && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Score Breakdown</h3>
                      <div className="space-y-4">
                        <BreakdownBar label="Skills" score={analysisResult.breakdown.skills} />
                        <BreakdownBar label="Projects" score={analysisResult.breakdown.projects} />
                        <BreakdownBar label="Experience" score={analysisResult.breakdown.experience} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <FlagsPanel flags={analysisResult.flags} />
                  <ExplanationPanel explanation={analysisResult.explanation} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
