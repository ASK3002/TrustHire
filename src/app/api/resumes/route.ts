import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Resume from '@/models/Resume'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const resumes = await Resume.find({ 
      trustScore: { $ne: null } 
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: resumes,
    })
  } catch (error) {
    console.error('Fetch resumes error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}
