'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, X, Github, CheckCircle } from 'lucide-react'

const SKILLS_BY_CATEGORY = {
  frontend: {
    label: 'Frontend',
    skills: ['react', 'vue', 'angular', 'typescript', 'javascript', 'css', 'html']
  },
  backend: {
    label: 'Backend',
    skills: ['node', 'express', 'python', 'java', 'go', 'rust', 'php']
  },
  database: {
    label: 'Database',
    skills: ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch']
  },
  tools: {
    label: 'Tools & Platforms',
    skills: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins']
  },
  apis: {
    label: 'APIs & Architectures',
    skills: ['rest api', 'graphql', 'microservices', 'grpc', 'websocket']
  },
  testing: {
    label: 'Testing',
    skills: ['jest', 'mocha', 'pytest', 'unittest', 'selenium', 'cypress']
  }
}

const DEFAULT_SKILLS = [
  'javascript', 'react', 'node', 'python', 'sql', 'mongodb',
  'typescript', 'express', 'next', 'vue', 'angular', 'aws',
  'docker', 'kubernetes', 'git', 'rest api', 'graphql', 'microservices',
]

interface UploadResumeProps {
  onAnalyze: (file: File, githubUsername: string, selectedSkills: string[], codeforcesHandle: string) => Promise<void>
}

export function UploadResume({ onAnalyze }: UploadResumeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [githubUsername, setGithubUsername] = useState('')
  const [githubDetecting, setGithubDetecting] = useState(false)
  const [githubAutoFilled, setGithubAutoFilled] = useState(false)
  
  const [codeforcesHandle, setCodeforcesHandle] = useState('')
  const [cfDetecting, setCfDetecting] = useState(false)
  const [cfAutoFilled, setCfAutoFilled] = useState(false)

  const [selectedSkills, setSelectedSkills] = useState<string[]>(DEFAULT_SKILLS)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  const processFile = async (file: File) => {
    setResumeFile(file)
    setGithubAutoFilled(false)
    setCfAutoFilled(false)

    setGithubDetecting(true)
    setCfDetecting(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const response = await fetch('/api/trust/upload-resume', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      const detectedGithub = data?.data?.contactInfo?.github
      if (detectedGithub) {
        setGithubUsername(detectedGithub)
        setGithubAutoFilled(true)
      }

      const detectedCf = data?.data?.contactInfo?.codeforces
      if (detectedCf) {
        setCodeforcesHandle(detectedCf)
        setCfAutoFilled(true)
      }
    } catch (err) {
      console.warn('GitHub auto-detect failed:', err)
    } finally {
      setGithubDetecting(false)
      setCfDetecting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const selectCategory = (categorySkills: string[]) => {
    const newSkills = new Set(selectedSkills)
    categorySkills.forEach(skill => newSkills.add(skill))
    setSelectedSkills(Array.from(newSkills))
  }

  const deselectCategory = (categorySkills: string[]) => {
    setSelectedSkills(prev =>
      prev.filter(skill => !categorySkills.includes(skill))
    )
  }

  const clearAll = () => {
    setSelectedSkills([])
  }

  const selectAll = () => {
    const allSkills = new Set<string>()
    Object.values(SKILLS_BY_CATEGORY).forEach(category => {
      category.skills.forEach(skill => allSkills.add(skill))
    })
    setSelectedSkills(Array.from(allSkills))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeFile) {
      alert('Please upload a resume')
      return
    }

    if (selectedSkills.length === 0) {
      alert('Please select at least one skill to analyze')
      return
    }

    setIsLoading(true)
    try {
      await onAnalyze(resumeFile, githubUsername, selectedSkills, codeforcesHandle)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Upload Resume
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              {githubDetecting ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-500" />
              )}
              <p className="text-gray-600 font-medium">
                {githubDetecting
                  ? 'Parsing resume...'
                  : resumeFile
                  ? resumeFile.name
                  : isDragging
                  ? 'Drop it here!'
                  : 'Click to upload or drag resume (PDF/TXT)'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GitHub Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Github className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => {
                setGithubUsername(e.target.value)
                setGithubAutoFilled(false)
              }}
              placeholder="e.g., torvalds"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            {githubDetecting && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </span>
            )}
            {!githubDetecting && githubAutoFilled && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </span>
            )}
          </div>
          {githubDetecting && (
            <p className="mt-1 text-sm text-blue-500">Detecting GitHub username from resume...</p>
          )}
          {!githubDetecting && githubAutoFilled && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Auto-filled from resume — you can edit if needed
            </p>
          )}
          {!githubDetecting && !githubAutoFilled && (
            <p className="mt-1 text-sm text-gray-500">Leave empty to skip GitHub analysis</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Codeforces Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
              CF
            </span>
            <input
              type="text"
              value={codeforcesHandle}
              onChange={(e) => {
                setCodeforcesHandle(e.target.value)
                setCfAutoFilled(false)
              }}
              placeholder="e.g., tourist"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            {cfDetecting && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </span>
            )}
            {!cfDetecting && cfAutoFilled && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </span>
            )}
          </div>
          {cfDetecting && (
            <p className="mt-1 text-sm text-blue-500">Detecting Codeforces handle from resume...</p>
          )}
          {!cfDetecting && cfAutoFilled && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Auto-filled from resume — you can edit if needed
            </p>
          )}
          {!cfDetecting && !cfAutoFilled && (
            <p className="mt-1 text-sm text-gray-500">Leave empty to skip Codeforces verification</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Skills to Analyze ({selectedSkills.length})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            {Object.entries(SKILLS_BY_CATEGORY).map(([categoryKey, category]) => {
              const isExpanded = expandedCategory === categoryKey
              const categorySelected = category.skills.every(s => selectedSkills.includes(s))
              const categorySomeSelected = category.skills.some(s => selectedSkills.includes(s)) && !categorySelected

              return (
                <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={categorySelected}
                        onChange={() =>
                          categorySelected
                            ? deselectCategory(category.skills)
                            : selectCategory(category.skills)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer"
                        ref={(el) => {
                          if (el && categorySomeSelected) {
                            el.indeterminate = true
                          }
                        }}
                      />
                      <span className="font-medium text-gray-700">{category.label}</span>
                      <span className="text-xs text-gray-500">
                        ({category.skills.filter(s => selectedSkills.includes(s)).length}/{category.skills.length})
                      </span>
                    </div>
                    <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            selectedSkills.includes(skill)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {selectedSkills.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Selected Skills:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !resumeFile || selectedSkills.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Profile'
          )}
        </button>
      </form>
    </div>
  )
}
