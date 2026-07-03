import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkAuth from '@/models/WorkAuth'

export async function GET(
  req: NextRequest,
  { params }: { params: { resumeId: string } }
) {
  try {
    await connectDB()

    const workAuths = await WorkAuth.find({ resumeId: params.resumeId }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: workAuths,
    })
  } catch (error) {
    console.error('Get work auth by resume error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work auth records' },
      { status: 500 }
    )
  }
}
