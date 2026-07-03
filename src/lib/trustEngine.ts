import { geminiService } from './geminiService'
import { githubService } from './githubService'
import { codeforcesService } from './codeforcesService'
import { parserService } from './parserService'

const DEFAULT_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST APIs'
]

export class TrustEngine {
  private weights = {
    skills: 0.35,
    projects: 0.35,
    experience: 0.30,
  }

  async analyzeCandidateProfile(
    resumeData: string,
    githubUsername: string | null,
    selectedSkills: string[] = [],
    codeforcesHandle: string | null = null
  ) {
    try {
      console.log('🔍 Starting TrustScore analysis...')
      console.log('   Received selectedSkills:', selectedSkills)
      console.log('   Codeforces Handle:', codeforcesHandle)

      const skillsToAnalyze = selectedSkills && selectedSkills.length > 0 ? selectedSkills : DEFAULT_SKILLS
      
      console.log('🎯 Skills to analyze:', skillsToAnalyze.length)

      const resumeInfo = this.extractResumeInfo(resumeData, skillsToAnalyze)
      console.log('📄 Resume parsed:', Object.keys(resumeInfo))
      console.log('   Found skills in resume:', resumeInfo.skills)

      const contactInfo = parserService.extractContactInfo(resumeData)
      const cfClaimedRank = contactInfo.cfClaimedRank
      if (cfClaimedRank) {
        console.log('   Claimed Codeforces Rank:', cfClaimedRank)
      }

      let githubData: any = {}
      if (githubUsername) {
        githubData = await githubService.fetchLightweightData(githubUsername)
        console.log('🐙 GitHub lightweight data fetched')
      }

      let codeforcesData: any = null
      if (codeforcesHandle && codeforcesHandle.trim()) {
        codeforcesData = await codeforcesService.fetchUserData(codeforcesHandle)
        console.log('🏆 Codeforces data fetched for handle:', codeforcesHandle)
      } else {
        console.log('⏭️ Skipping Codeforces verification - no handle provided')
      }

      const aiAnalysis = await geminiService.analyzeCandidate({
        resume: resumeInfo,
        github: githubData,
      })
      console.log('🧠 AI analysis complete')

      let cfVerification: any = null
      if (codeforcesData && cfClaimedRank) {
        cfVerification = codeforcesService.verifyRank(cfClaimedRank, codeforcesData)
      }

      const scores = this.calculateScores(resumeInfo, githubData, aiAnalysis)

      const verdict = this.determineVerdict(scores, aiAnalysis)

      const explanation = this.generateExplanation(
        scores,
        aiAnalysis,
        codeforcesData,
        cfClaimedRank,
        cfVerification
      )

      const trustScore = {
        trustScore: scores.overall,
        verdict,
        breakdown: {
          skills: scores.skills,
          projects: scores.projects,
          experience: scores.experience,
        },
        flags: aiAnalysis.suspicionFlags || [],
        explanation,
        rawAnalysis: aiAnalysis,
        timestamp: new Date().toISOString(),
        selectedSkills: skillsToAnalyze,
        githubData,
        codeforcesData,
        cfClaimedRank,
        cfVerification,
      }

      return trustScore
    } catch (error) {
      console.error('❌ TrustEngine error:', error)
      throw error
    }
  }

  private extractResumeInfo(resumeData: string, skillKeywords: string[]) {
    return {
      fullText: resumeData,
      skills: this.extractSkills(resumeData, skillKeywords),
      projects: this.extractProjects(resumeData),
      experience: this.extractExperience(resumeData),
      education: this.extractEducation(resumeData),
    }
  }

  private extractSkills(text: string, skillKeywords: string[]): string[] {
    const keywords = skillKeywords.length > 0 ? skillKeywords : DEFAULT_SKILLS
    const skills: string[] = []
    keywords.forEach((skill) => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill)
      }
    })
    return skills
  }

  private extractProjects(text: string): string[] {
    const projectRegex = /project[s]?[:\s]*([\s\S]*?)(?=education|experience|skills|$)/i
    const match = text.match(projectRegex)
    return match ? [match[1].trim()] : []
  }

  private extractExperience(text: string): string {
    const expRegex = /experience[:\s]*([\s\S]*?)(?=education|projects|skills|$)/i
    const match = text.match(expRegex)
    return match ? match[1].trim() : ''
  }

  private extractEducation(text: string): string {
    const eduRegex = /education[:\s]*([\s\S]*?)(?=experience|projects|skills|$)/i
    const match = text.match(eduRegex)
    return match ? match[1].trim() : ''
  }

  private calculateScores(resumeInfo: any, githubData: any, aiAnalysis: any) {
    const skills = this.calculateSkillsScore(resumeInfo, githubData, aiAnalysis)
    const projects = this.calculateProjectsScore(resumeInfo, githubData, aiAnalysis)
    const experience = this.calculateExperienceScore(resumeInfo, githubData, aiAnalysis)

    const overall = Math.round(
      skills * this.weights.skills +
      projects * this.weights.projects +
      experience * this.weights.experience
    )

    return { skills, projects, experience, overall }
  }

  private calculateSkillsScore(resumeInfo: any, githubData: any, aiAnalysis: any): number {
    let score = 80

    if (githubData.languages && githubData.languages.length > 0) {
      const verifiedSkills = resumeInfo.skills.filter((skill: string) =>
        githubData.languages.some((lang: string) =>
          lang.toLowerCase().includes(skill.toLowerCase())
        )
      )
      score += verifiedSkills.length * 3
    }

    if (aiAnalysis.skillsConsistency === 'low') {
      score -= 10
    } else if (aiAnalysis.skillsConsistency === 'medium') {
      score -= 3
    }

    if (aiAnalysis.suspicionFlags) {
      const skillFlags = aiAnalysis.suspicionFlags.filter((flag: string) =>
        flag.toLowerCase().includes('skill') ||
        flag.toLowerCase().includes('unverified') ||
        flag.toLowerCase().includes('mismatch')
      )
      score -= skillFlags.length * 8
    }

    return Math.max(0, Math.min(100, score))
  }

  private calculateProjectsScore(resumeInfo: any, githubData: any, aiAnalysis: any): number {
    let score = 80

    if (githubData.publicRepos && githubData.publicRepos > 0) {
      score += Math.min(githubData.publicRepos, 15)
    }


    if (aiAnalysis.projectsConsistency === 'low') {
      score -= 10
    } else if (aiAnalysis.projectsConsistency === 'medium') {
      score -= 5
    }

    if (aiAnalysis.suspicionFlags) {
      const projectFlags = aiAnalysis.suspicionFlags.filter((flag: string) =>
        flag.toLowerCase().includes('project') ||
        flag.toLowerCase().includes('repository')
      )
      score -= projectFlags.length * 8
    }

    return Math.max(0, Math.min(100, score))
  }

  private calculateExperienceScore(resumeInfo: any, githubData: any, aiAnalysis: any): number {
    let score = 80

    if (resumeInfo.experience && resumeInfo.experience.length > 0) {
      score += 10
    }

    if (githubData.yearsSinceCreated && githubData.yearsSinceCreated > 2) {
      score += 5
    }

    if (aiAnalysis.experienceConsistency === 'low') {
      score -= 10
    } else if (aiAnalysis.experienceConsistency === 'medium') {
      score -= 5
    }

    if (aiAnalysis.suspicionFlags) {
      const experienceFlags = aiAnalysis.suspicionFlags.filter((flag: string) =>
        flag.toLowerCase().includes('experience') ||
        flag.toLowerCase().includes('gap')
      )
      score -= experienceFlags.length * 8
    }

    return Math.max(0, Math.min(100, score))
  }

  private determineVerdict(scores: any, aiAnalysis: any): string {
    const overallScore = scores.overall
    const flagCount = (aiAnalysis.suspicionFlags || []).length

    if (flagCount >= 3) {
      return 'Needs Verification'
    }

    if (overallScore >= 70) {
      return 'Trusted'
    }

    if (overallScore >= 50 && overallScore < 70) {
      return 'Acceptable'
    }

    return 'Needs Review'
  }

  private generateExplanation(scores: any, aiAnalysis: any, codeforcesData: any, cfClaimedRank: string, cfVerification: any): string {
    let explanation = ''

    if (scores.skills >= 75) {
      explanation += 'Skills are well-verified on GitHub. '
    } else if (scores.skills >= 50) {
      explanation += 'Some claimed skills lack GitHub verification. '
    } else {
      explanation += 'Skills show significant inconsistencies. '
    }

    if (scores.projects >= 75) {
      explanation += 'Project portfolio demonstrates strong capability. '
    } else if (scores.projects >= 50) {
      explanation += 'Limited project evidence or activity. '
    } else {
      explanation += 'Projects show major discrepancies. '
    }

    if (scores.experience >= 75) {
      explanation += 'Experience is well-documented and verified. '
    } else if (scores.experience >= 50) {
      explanation += 'Some experience claims need verification. '
    } else {
      explanation += 'Experience shows potential red flags. '
    }

    if (aiAnalysis.reasoning) {
      explanation += `\n\nAI Analysis: ${aiAnalysis.reasoning}`
    }

    if (codeforcesData) {
      explanation += '\n\nCodeforces Verification:'
      explanation += `\n- Handle: ${codeforcesData.handle}`
      explanation += `\n- Actual Max Rank: ${codeforcesData.maxRank || 'Unknown'}`
      explanation += `\n- Max Rating: ${codeforcesData.maxRating || 'N/A'}`
      if (cfClaimedRank && cfVerification) {
        explanation += `\n- Resume Claimed Rank: ${cfClaimedRank}`
        if (cfVerification.verified === false) {
          explanation += `\n- Inconsistency: ${cfVerification.flag}`
        } else if (cfVerification.verified === true) {
          explanation += `\n- Status: Rank Consistency Verified`
        }
      }
    }

    return explanation
  }
}

export const trustEngine = new TrustEngine()
