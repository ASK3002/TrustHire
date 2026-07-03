import twilio from 'twilio'
import nodemailer from 'nodemailer'

const TWILIO_SID = process.env.TWILIO_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE = process.env.TWILIO_PHONE
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const twilioClient = TWILIO_SID ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN) : null

const emailTransporter = EMAIL_USER
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null

export const workAuthService = {
  async sendVerificationSMS(pocPhone: string, candidateName: string, organizationName: string) {
    try {
      if (!twilioClient) {
        return { status: 'failed', reason: 'Twilio not configured' }
      }

      if (!TWILIO_PHONE) {
        return { status: 'failed', reason: 'TWILIO_PHONE not configured' }
      }

      const smsMessage = `Hi, this is TrustHire. We are verifying the work experience of ${candidateName} at ${organizationName}. Please check your email for verification link. Thank you.`

      const message = await twilioClient.messages.create({
        body: smsMessage,
        from: TWILIO_PHONE,
        to: pocPhone,
      })

      return {
        status: 'pending',
        callSid: message.sid,
        message: 'Verification SMS sent',
      }
    } catch (error) {
      console.error('SMS failed:', error)
      return { status: 'failed', reason: (error as Error).message }
    }
  },

  async sendVerificationEmail(
    pocEmail: string,
    candidateName: string,
    organizationName: string,
    verificationId: string
  ) {
    try {
      if (!emailTransporter) {
        return { status: 'failed', reason: 'Email not configured' }
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyYesLink = `${baseUrl}/api/work-auth/verify?status=yes&id=${verificationId}`
      const verifyNoLink = `${baseUrl}/api/work-auth/verify?status=no&id=${verificationId}`

      const mailOptions = {
        from: EMAIL_USER,
        to: pocEmail,
        subject: 'Work Experience Verification - TrustHire',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Work Experience Verification</h2>
            <p>Hi,</p>
            <p>We are from <strong>TrustHire</strong>.</p>
            <p>We want to verify the work experience of <strong>${candidateName}</strong> at <strong>${organizationName}</strong>.</p>
            <p><strong>Please confirm:</strong></p>
            <div style="margin: 20px 0;">
              <a href="${verifyYesLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px;">✓ YES</a>
              <a href="${verifyNoLink}" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">✗ NO</a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
            <p style="color: #999; font-size: 11px;">TrustHire - AI Hiring Intelligence Platform</p>
          </div>
        `,
      }

      const result = await emailTransporter.sendMail(mailOptions)

      return {
        status: 'pending',
        messageId: result.messageId,
        message: 'Verification email sent',
      }
    } catch (error) {
      console.error('Email failed:', error)
      return { status: 'failed', reason: (error as Error).message }
    }
  },
}
