import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TrustScore from '@/models/TrustScore'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const candidate = await TrustScore.findOne({ resumeId: params.id })

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: candidate,
    })
  } catch (error) {
    console.error('Get candidate error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate' },
      { status: 500 }
    )
  }
}
