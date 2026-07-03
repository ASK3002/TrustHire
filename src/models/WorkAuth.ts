import mongoose from 'mongoose'

const WorkAuthSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true
})

export default mongoose.models.WorkAuth || mongoose.model('WorkAuth', WorkAuthSchema)
