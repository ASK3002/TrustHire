import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkAuth from '@/models/WorkAuth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const workAuths = await WorkAuth.find().sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: workAuths,
    })
  } catch (error) {
    console.error('Fetch work auths error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work auth records' },
      { status: 500 }
    )
  }
}
