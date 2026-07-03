import { GoogleGenAI } from '@google/genai'

class GeminiService {
  private client: any

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('⚠️  [Gemini] GEMINI_API_KEY not found in environment')
    } else {
      console.log('✅ [Gemini] API key loaded:', apiKey.slice(0, 6) + '...' + apiKey.slice(-4))
    }
    this.client = new GoogleGenAI({ apiKey })
  }

  async analyzeCandidate(data: any) {
    try {
      const { resume, github } = data

      console.log('\n📊 ===== CANDIDATE PROFILE ANALYSIS =====')
      console.log('\n📋 RESUME DATA EXTRACTED:')
      console.log(`   • Skills Found: ${resume.skills?.length || 0} - ${resume.skills?.join(', ') || 'None'}`)
      console.log(`   • Projects: ${resume.projects?.length || 0}`)
      console.log(`   • Experience: ${resume.experience ? resume.experience.substring(0, 100) + '...' : 'None'}`)

      console.log('\n🐙 GITHUB DATA EXTRACTED:')
      console.log(`   • Username: ${github.username || 'N/A'}`)
      console.log(`   • Public Repos: ${github.publicRepos || 0}`)
      console.log(`   • Languages: ${github.languages?.length || 0} - ${github.languages?.join(', ') || 'None'}`)
      console.log(`   • Active Days: ${github.activeDays || 0}`)
      console.log(`   • Estimated Commits: ${github.estimatedCommits || 0}`)

      const prompt = this.generateAnalysisPrompt(resume, github)

      console.log('\n📤 Sending to Gemini for professional analysis...')
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      console.log('📥 Analysis response received')
      const parsed = this.parseAnalysisResponse(response.text, resume, github)

      console.log('\n📊 ===== ANALYSIS RESULTS =====')
      console.log(`   Skills Consistency: ${parsed.skillsConsistency}`)
      console.log(`   Projects Consistency: ${parsed.projectsConsistency}`)
      console.log(`   Experience Consistency: ${parsed.experienceConsistency}`)
      console.log(`   Suspension Flags: ${parsed.suspicionFlags?.length || 0}`)

      return parsed
    } catch (error) {
      console.error('❌ [Gemini] API call failed!')
      console.warn('⚠️  [Gemini] Falling back to heuristic analysis')
      return this.getDefaultAnalysis(data)
    }
  }

  private generateAnalysisPrompt(resume: any, github: any): string {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    
    return `
You are a professional hiring expert analyzing a candidate's profile for authenticity.
Be FAIR and BALANCED - not harsh, but objective. Identify red flags clearly.

IMPORTANT: Current date is ${currentDate}. When evaluating experience dates, compare them against this date.

RESUME DATA:
Skills: ${resume.skills?.join(', ') || 'N/A'}
Projects: ${resume.projects?.join(', ') || 'N/A'}
Experience: ${resume.experience || 'N/A'}
Education: ${resume.education || 'N/A'}

GITHUB DATA (IF AVAILABLE):
Username: ${github.username || 'N/A'}
Public Repos: ${github.publicRepos || 0}
Followers: ${github.followers || 0}
Languages: ${github.languages?.join(', ') || 'N/A'}

ANALYZE AND IDENTIFY:
1. Do claimed skills match GitHub languages?
2. Are there major inconsistencies between resume and GitHub?
3. Is project portfolio credible?
4. Does experience description sound authentic?
5. Are there any RED FLAGS?

RED FLAGS TO IDENTIFY:
- Skills claimed but no evidence in GitHub
- Projects mentioned but no GitHub evidence
- Suspicious gaps or timeline issues
- Over-exaggeration of abilities
- Conflicting information between resume and GitHub

FAIR ASSESSMENT RULES:
- It's OK to lack GitHub evidence if candidate is new
- Learning and growth are positive signals
- Minor inconsistencies are acceptable
- BUT clearly identify if major discrepancies exist

Provide BALANCED analysis in JSON format:
{
  "skillsConsistency": "high|medium|low",
  "projectsConsistency": "high|medium|low",
  "experienceConsistency": "high|medium|low",
  "suspicionFlags": ["clear flag 1", "clear flag 2"],
  "reasoning": "detailed explanation with specifics",
  "overallAssessment": "genuine|questionable|fabricated",
  "summary": "Provide a concise 2-4 line summary of the candidate's overall profile assessment suitable for database storage and quick UI display"
}
`
  }

  private parseAnalysisResponse(responseText: string, resume: any, github: any) {
    try {
      console.log('🔍 [Gemini] Attempting JSON parse from response...')
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('✅ [Gemini] JSON parsed successfully')
        return parsed
      }

      console.warn('⚠️  [Gemini] No JSON block found in response, using fallback')
      return {
        skillsConsistency: this.detectConsistency(responseText, 'skills'),
        projectsConsistency: this.detectConsistency(responseText, 'project'),
        experienceConsistency: this.detectConsistency(responseText, 'experience'),
        suspicionFlags: this.extractFlags(responseText),
        reasoning: responseText.substring(0, 500),
        overallAssessment: responseText.toLowerCase().includes('genuine') ? 'genuine' : 'questionable',
      }
    } catch (error) {
      console.error('❌ [Gemini] Failed to parse response JSON:', error)
      return this.getDefaultAnalysis({ resume, github })
    }
  }

  private detectConsistency(text: string, keyword: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes(`${keyword} inconsistent`) || lowerText.includes(`${keyword} mismatch`)) {
      return 'low'
    }
    if (lowerText.includes(`${keyword} partially`) || lowerText.includes(`some ${keyword}`)) {
      return 'medium'
    }
    return 'high'
  }

  private extractFlags(text: string): string[] {
    const flags: string[] = []
    const badKeywords = ['exaggerat', 'fabricat', 'inconsisten', 'red flag', 'mislead', 'dishonest', 'falsif', 'gap', 'inactivit']
    badKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        flags.push(`Detected: ${keyword}`)
      }
    })
    return flags
  }

  private getDefaultAnalysis(data: any) {
    console.log('🔄 [Gemini] Running heuristic (offline) analysis...')
    const { resume, github } = data

    let skillsConsistency = 'medium'
    let projectsConsistency = 'medium'
    let experienceConsistency = 'medium'
    const flags: string[] = []

    if (github.languages && github.languages.length > 0) {
      const verifiedSkills = (resume.skills || []).filter((skill: string) =>
        github.languages.some((lang: string) => lang.toLowerCase().includes(skill.toLowerCase()))
      )
      skillsConsistency = verifiedSkills.length / Math.max(resume.skills.length, 1) > 0.5 ? 'high' : 'low'
    }

    if (github.publicRepos && github.publicRepos > 0) {
      projectsConsistency = 'high'
    }

    return {
      skillsConsistency,
      projectsConsistency,
      experienceConsistency,
      suspicionFlags: flags,
      reasoning: 'Analysis based on resume claims and available GitHub profile verification.',
      overallAssessment: flags.length > 3 ? 'questionable' : 'genuine',
    }
  }
}

export const geminiService = new GeminiService()
