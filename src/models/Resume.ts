import mongoose from 'mongoose'

const ResumeSchema = new mongoose.Schema({
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

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema)
