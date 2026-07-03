import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/mongodb'
import WorkAuth from '@/models/WorkAuth'
import Resume from '@/models/Resume'
import { workAuthService } from '@/lib/workAuthService'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { resumeId, candidateName, organizationName, pocEmail, pocPhone } = body

    if (!candidateName || !organizationName || !pocEmail || !pocPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Resume ID is optional - work auth can be done independently
    let resume = null
    if (resumeId) {
      resume = await Resume.findOne({ resumeId })
    }

    const verificationId = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const workAuth = await WorkAuth.create({
      resumeId,
      candidateName,
      organizationName,
      pocEmail,
      pocPhone,
      verificationId,
      status: 'pending',
      emailStatus: 'pending',
      smsStatus: 'pending',
      expiresAt,
    })

    const [emailResult, smsResult] = await Promise.all([
      workAuthService.sendVerificationEmail(pocEmail, candidateName, organizationName, verificationId),
      workAuthService.sendVerificationSMS(pocPhone, candidateName, organizationName),
    ])

    await WorkAuth.findByIdAndUpdate(workAuth._id, {
      emailStatus: emailResult.status === 'pending' ? 'sent' : 'failed',
      emailMessageId: emailResult.messageId,
      smsStatus: smsResult.status === 'pending' ? 'sent' : 'failed',
      smsCallSid: smsResult.callSid,
    })

    return NextResponse.json({
      success: true,
      data: {
        verificationId,
        message: 'Verification initiated successfully',
        emailStatus: emailResult.status,
        smsStatus: smsResult.status,
      },
    })
  } catch (error) {
    console.error('Work auth initiation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate work auth' },
      { status: 500 }
    )
  }
}
