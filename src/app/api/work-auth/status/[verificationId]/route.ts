import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkAuth from '@/models/WorkAuth'

export async function GET(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  try {
    await connectDB()

    const workAuth = await WorkAuth.findOne({ verificationId: params.verificationId })

    if (!workAuth) {
      return NextResponse.json(
        { success: false, error: 'Work auth not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workAuth,
    })
  } catch (error) {
    console.error('Get work auth status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work auth status' },
      { status: 500 }
    )
  }
}
