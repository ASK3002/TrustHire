import mongoose, { Schema, Document } from 'mongoose'

interface IResume extends Document {
  resumeId: string
  text: string
  contactInfo: {
    email?: string
    phone?: string
    linkedin?: string
    cfClaimedRank?: string
  }
  sections: {
    skills?: string
    experience?: string
    education?: string
    projects?: string
    certifications?: string
  }
  githubUsername?: string | null
  codeforcesHandle?: string | null
  selectedSkills: string[]
  parsedAt: Date
  aiSummary?: string | null
  trustScore?: number | null
  verdict?: string | null
}

const ResumeSchema = new Schema<IResume>({
  resumeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  contactInfo: {
    email: String,
    phone: String,
    linkedin: String,
    cfClaimedRank: String
  },
  sections: {
    skills: String,
    experience: String,
    education: String,
    projects: String,
    certifications: String
  },
  githubUsername: {
    type: String,
    default: null
  },
  codeforcesHandle: {
    type: String,
    default: null
  },
  selectedSkills: [{
    type: String
  }],
  parsedAt: {
    type: Date,
    default: Date.now
  },
  aiSummary: {
    type: String,
    default: null
  },
  trustScore: {
    type: Number,
    default: null
  },
  verdict: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

export default mongoose.models.Resume ||
  mongoose.model<IResume>('Resume', ResumeSchema)