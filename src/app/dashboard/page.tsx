'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Users, ShieldCheck, Mail, Github, Trophy, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [view, setView] = useState<'resume' | 'work-auth' | null>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const [workAuths, setWorkAuths] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (view === 'resume') {
      fetchResumes()
    } else if (view === 'work-auth') {
      fetchWorkAuths()
    }
  }, [view])

  const fetchResumes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/resumes')
      const data = await response.json()
      if (data.success) {
        setResumes(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkAuths = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/work-auth/all')
      const data = await response.json()
      if (data.success) {
        setWorkAuths(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch work auths:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'correct':
      case 'verified':
      case 'sent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'correct':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
      case 'failed':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!view ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <p className="text-gray-600 mb-12">Select a category to view candidates</p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <button
                onClick={() => setView('resume')}
                className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-8 transition-all hover:shadow-lg group"
              >
                <Users className="w-16 h-16 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Scored Candidates</h2>
                <p className="text-gray-600">View candidates whose resumes have been analyzed and scored by AI</p>
              </button>

              <button
                onClick={() => setView('work-auth')}
                className="bg-white border-2 border-gray-200 hover:border-purple-500 rounded-xl p-8 transition-all hover:shadow-lg group"
              >
                <ShieldCheck className="w-16 h-16 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Exp Authenticated Candidates</h2>
                <p className="text-gray-600">View candidates whose work experience has been verified</p>
              </button>
            </div>
          </div>
        ) : view === 'resume' ? (
          <div>
            <button
              onClick={() => setView(null)}
              className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Resume Scored Candidates</h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <p>No resume scored candidates found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div key={resume.resumeId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(resume.trustScore || 0)}`}>
                        Score: {resume.trustScore || 0}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">
                      {resume.contactInfo?.email || 'No email'}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {resume.contactInfo?.phone && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{resume.contactInfo.phone}</span>
                        </div>
                      )}
                      {resume.githubUsername && (
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          <span>{resume.githubUsername}</span>
                        </div>
                      )}
                      {resume.codeforcesHandle && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>{resume.codeforcesHandle}</span>
                        </div>
                      )}
                    </div>

                    {resume.aiSummary && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        <p className="line-clamp-4">{resume.aiSummary}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getScoreColor(resume.trustScore || 0)}`}>
                        {resume.verdict || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setView(null)}
              className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Work Exp Authenticated Candidates</h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : workAuths.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <p>No work auth records found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workAuths.map((auth) => (
                  <div key={auth.verificationId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(auth.status || 'pending')}`}>
                        {getStatusIcon(auth.status || 'pending')}
                        <span className="capitalize">{auth.status || 'Pending'}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(auth.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">
                      {auth.candidateName || 'Unknown Candidate'}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Organization:</span> {auth.organizationName}
                      </div>
                      <div>
                        <span className="font-medium">POC Email:</span> {auth.pocEmail}
                      </div>
                      <div>
                        <span className="font-medium">POC Phone:</span> {auth.pocPhone}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(auth.emailStatus || 'pending')}`}>
                        <span className="capitalize">{auth.emailStatus || 'Pending'}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(auth.smsStatus || 'pending')}`}>
                        <span className="capitalize">{auth.smsStatus || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
