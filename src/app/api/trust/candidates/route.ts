import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TrustScore from '@/models/TrustScore'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const candidates = await TrustScore.find()
      .sort({ analyzedAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('resumeId trustScore verdict breakdown flags explanation analyzedAt')

    return NextResponse.json({
      success: true,
      data: candidates,
    })
  } catch (error) {
    console.error('Get candidates error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}
