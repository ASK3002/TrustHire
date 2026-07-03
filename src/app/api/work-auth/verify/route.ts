import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkAuth from '@/models/WorkAuth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const id = searchParams.get('id')

    if (!status || !id) {
      return NextResponse.json(
        { success: false, error: 'Missing parameters' },
        { status: 400 }
      )
    }

    const workAuth = await WorkAuth.findOne({ verificationId: id })

    if (!workAuth) {
      return NextResponse.json(
        { success: false, error: 'Verification not found' },
        { status: 404 }
      )
    }

    if (workAuth.expiresAt && new Date() > workAuth.expiresAt) {
      await WorkAuth.findByIdAndUpdate(workAuth._id, { status: 'failed' })
      return NextResponse.redirect(new URL('/work-auth/expired', req.url))
    }

    if (status === 'yes') {
      await WorkAuth.findByIdAndUpdate(workAuth._id, {
        status: 'verified',
        response: 'yes',
        responseAt: new Date(),
      })
    } else if (status === 'no') {
      await WorkAuth.findByIdAndUpdate(workAuth._id, {
        status: 'rejected',
        response: 'no',
        responseAt: new Date(),
      })
    }

    return NextResponse.redirect(new URL('/work-auth/success', req.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
