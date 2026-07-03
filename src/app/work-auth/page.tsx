'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Loader2, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function WorkAuthPage() {
  const [pocPhone, setPocPhone] = useState('')
  const [pocEmail, setPocEmail] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [organizationName, setOrganizationName] = useState('')

  const [recordId, setRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)

  // Poll for status updates when recordId exists
  useEffect(() => {
    if (!recordId) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/work-auth/status/${recordId}`)
        const data = await response.json()
        if (data.success) {
          setStatus(data.data)
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }

    // Initial poll
    pollStatus()

    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000)

    return () => clearInterval(interval)
  }, [recordId])

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/work-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pocPhone,
          pocEmail,
          candidateName,
          organizationName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRecordId(data.data.verificationId)
        setSuccessMessage(data.data.message)
        setStatus({
          callStatus: 'pending',
          mailStatus: 'pending',
          finalStatus: 'pending',
        })
      } else {
        setError(data.error || 'Failed to start verification')
      }
    } catch (err) {
      setError('Failed to start verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReAuthenticate = () => {
    setRecordId(null)
    setStatus(null)
    setPocPhone('')
    setPocEmail('')
    setCandidateName('')
    setOrganizationName('')
    setError(null)
    setSuccessMessage(null)
  }

  const StatusBadge = ({ label, status }: { label: string; status: string }) => {
    const getIcon = (s: string) => {
      switch (s) {
        case 'accepted':
        case 'correct':
        case 'verified':
        case 'sent':
          return <CheckCircle className="w-5 h-5 text-green-600" />
        case 'failed':
        case 'rejected':
          return <XCircle className="w-5 h-5 text-red-500" />
        default:
          return <Clock className="w-5 h-5 text-yellow-500" />
      }
    }

    const getColor = (s: string) => {
      switch (s) {
        case 'accepted':
        case 'correct':
        case 'verified':
        case 'sent':
          return 'bg-green-50 border-green-200'
        case 'failed':
        case 'rejected':
          return 'bg-red-50 border-red-200'
        default:
          return 'bg-yellow-50 border-yellow-200'
      }
    }

    return (
      <div
        className={`p-3 border rounded-lg flex items-center gap-3 ${getColor(
          status
        )}`}
      >
        {getIcon(status)}
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-600 capitalize">{status}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Work Experience Authentication
          </h1>
          <p className="text-gray-600">
            Verify candidate work experience through phone call and email
          </p>
        </div>

        {!recordId ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <form onSubmit={handleStartVerification} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    POC Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={pocPhone}
                    onChange={(e) => setPocPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    POC Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={pocEmail}
                    onChange={(e) => setPocEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="Tech Company Inc."
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Verification...
                  </>
                ) : (
                  'Authenticate'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                ✅ {successMessage}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <StatusBadge label="SMS Status" status={status?.smsStatus || 'pending'} />
              <StatusBadge label="Email Status" status={status?.emailStatus || 'pending'} />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Verification Details
              </h3>
              <div className="space-y-3 text-sm text-gray-900">
                <p>
                  <span className="text-gray-600">Phone:</span>{' '}
                  <span className="font-medium">{pocPhone}</span>
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium">{pocEmail}</span>
                </p>
                {candidateName && (
                  <p>
                    <span className="text-gray-600">Candidate:</span>{' '}
                    <span className="font-medium">{candidateName}</span>
                  </p>
                )}
                {organizationName && (
                  <p>
                    <span className="text-gray-600">Organization:</span>{' '}
                    <span className="font-medium">{organizationName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Final Status
              </h3>
              <StatusBadge
                label="Verification Result"
                status={status?.status || 'pending'}
              />
              {status?.status === 'pending' && (
                <p className="text-sm text-gray-600 mt-4">
                  ⏳ Waiting for POC response via phone and email...
                </p>
              )}
              {status?.status === 'verified' && (
                <p className="text-sm text-green-700 mt-4 font-medium">
                  ✅ Work experience verified as correct!
                </p>
              )}
              {status?.status === 'rejected' && (
                <p className="text-sm text-red-700 mt-4 font-medium">
                  ❌ Work experience verification rejected.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              {status?.status !== 'pending' && (
                <button
                  onClick={handleReAuthenticate}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Verify Another
                </button>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
