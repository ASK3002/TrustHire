import mongoose, { Schema, Document } from 'mongoose'

export type Verdict =
  | 'Trusted'
  | 'Acceptable'
  | 'Needs Review'
  | 'Needs Verification'

interface ITrustScore extends Document {
  resumeId: string
  trustScore: number
  verdict: Verdict
  breakdown?: {
    skills?: number
    projects?: number
    experience?: number
  }
  flags?: string[]
  explanation?: string
  rawAnalysis?: unknown
  githubData?: unknown
  codeforcesData?: unknown
  cfClaimedRank?: string
  cfVerification?: unknown
  selectedSkills?: string[]
  analyzedAt?: Date
}

const TrustScoreSchema = new Schema<ITrustScore>({
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
    enum: [
      'Trusted',
      'Acceptable',
      'Needs Review',
      'Needs Verification'
    ]
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
    type: Schema.Types.Mixed
  },

  githubData: {
    type: Schema.Types.Mixed
  },

  codeforcesData: {
    type: Schema.Types.Mixed
  },

  cfClaimedRank: String,

  cfVerification: {
    type: Schema.Types.Mixed
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


const TrustScore =
  mongoose.models.TrustScore as mongoose.Model<ITrustScore> ||
  mongoose.model<ITrustScore>('TrustScore', TrustScoreSchema)


export default TrustScore