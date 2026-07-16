import { NextRequest, NextResponse } from 'next/server'
import { trustEngine } from '@/lib/trustEngine'
import connectDB from '@/lib/mongodb'
import Resume from '@/models/Resume'
import TrustScore, { Verdict } from '@/models/TrustScore'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { resumeId, githubUsername, selectedSkills, codeforcesHandle } = body

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      )
    }

    const resume = await Resume.findOne({ resumeId })

    if (!resume) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      )
    }


    const trustScore = await trustEngine.analyzeCandidateProfile(
      resume.text,
      githubUsername || resume.githubUsername,
      selectedSkills,
      codeforcesHandle || resume.codeforcesHandle
    )


    const savedScore = await TrustScore.create({
      resumeId,
      trustScore: trustScore.trustScore,

      // Fix TypeScript enum mismatch
      verdict: trustScore.verdict as Verdict,

      breakdown: trustScore.breakdown,
      flags: trustScore.flags,
      explanation: trustScore.explanation,
      rawAnalysis: trustScore.rawAnalysis,
      githubData: trustScore.githubData,
      codeforcesData: trustScore.codeforcesData,
      cfClaimedRank: trustScore.cfClaimedRank,
      cfVerification: trustScore.cfVerification,
      selectedSkills: trustScore.selectedSkills,
      analyzedAt: new Date(),
    })


    await Resume.findOneAndUpdate(
      { resumeId },
      {
        aiSummary: trustScore.rawAnalysis?.summary || null,
        trustScore: trustScore.trustScore,
        verdict: trustScore.verdict,
      }
    )


    return NextResponse.json({
      success: true,
      data: trustScore,
      storageId: savedScore._id,
    })


  } catch (error) {
    console.error('Analysis error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to analyze candidate' },
      { status: 500 }
    )
  }
}