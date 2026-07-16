import mongoose, { Schema, Document } from 'mongoose'

interface IWorkAuth extends Document {
  resumeId?: string
  candidateName: string
  organizationName: string
  pocEmail: string
  pocPhone: string
  verificationId: string
  status: 'pending' | 'verified' | 'rejected' | 'failed'
  emailStatus: 'pending' | 'sent' | 'failed'
  smsStatus: 'pending' | 'sent' | 'failed'
  emailMessageId?: string
  smsCallSid?: string
  response?: 'yes' | 'no' | null
  responseAt?: Date
  expiresAt?: Date
}

const WorkAuthSchema = new Schema<IWorkAuth>({
  resumeId: {
    type: String,
    required: false,
    index: true,
    ref: 'Resume'
  },

  candidateName: {
    type: String,
    required: true
  },

  organizationName: {
    type: String,
    required: true
  },

  pocEmail: {
    type: String,
    required: true
  },

  pocPhone: {
    type: String,
    required: true
  },

  verificationId: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'failed'],
    default: 'pending'
  },

  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },

  smsStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },

  emailMessageId: String,

  smsCallSid: String,

  response: {
    type: String,
    enum: ['yes', 'no'],
    default: null
  },

  responseAt: Date,

  expiresAt: Date

}, {
  timestamps: true
})


const WorkAuth =
  mongoose.models.WorkAuth as mongoose.Model<IWorkAuth> ||
  mongoose.model<IWorkAuth>('WorkAuth', WorkAuthSchema)


export default WorkAuth