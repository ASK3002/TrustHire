import mongoose from 'mongoose'

const TrustScoreSchema = new mongoose.Schema({
  resumeId: {
    type: String,
    required: true,
    index: true,
    ref: 'Resume'
  },
  trustScore: {
    type: Number,
    required: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Trusted', 'Acceptable', 'Needs Review', 'Needs Verification']
  },
  breakdown: {
    skills: Number,
    projects: Number,
    experience: Number
  },
  flags: [{
    type: String
  }],
  explanation: {
    type: String
  },
  rawAnalysis: {
    type: mongoose.Schema.Types.Mixed
  },
  githubData: {
    type: mongoose.Schema.Types.Mixed
  },
  codeforcesData: {
    type: mongoose.Schema.Types.Mixed
  },
  cfClaimedRank: String,
  cfVerification: {
    type: mongoose.Schema.Types.Mixed
  },
  selectedSkills: [{
    type: String
  }],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.models.TrustScore || mongoose.model('TrustScore', TrustScoreSchema)
