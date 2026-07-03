import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'

export class ParserService {
  async parseResume(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      const fileExtension = path.extname(filePath).toLowerCase()

      if (fileExtension === '.pdf') {
        return await this.parsePDF(filePath)
      } else if (fileExtension === '.txt') {
        return await this.parseTXT(filePath)
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}. Use PDF or TXT.`)
      }
    } catch (error) {
      console.error('❌ Parser error:', error)
      throw error
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      if (dataBuffer.length === 0) {
        throw new Error('PDF file is empty')
      }
      const data = await pdfParse(dataBuffer)
      if (!data.text) {
        throw new Error('Could not extract text from PDF')
      }
      return data.text
    } catch (error) {
      console.error('❌ PDF parsing error:', error)
      throw new Error(`Failed to parse PDF: ${error}`)
    }
  }

  private async parseTXT(filePath: string): Promise<string> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (!content || content.trim().length === 0) {
        throw new Error('TXT file is empty')
      }
      return content
    } catch (error) {
      console.error('❌ TXT reading error:', error)
      throw new Error(`Failed to read TXT file: ${error}`)
    }
  }

  extractContactInfo(text: string) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i
    const githubUrlRegex = /github\.com\/([\w-]+)/i
    const githubLabelRegex = /github[:\s]+([\w-]+)/i
    const githubAtRegex = /@([\w-]+)\s*(?:github|gh)/i
    const cfUrlRegex = /codeforces\.com\/profile\/([\w-]+)/i
    const cfLabelRegex = /codeforces[:\s]+([\w-]+)/i
    const cfAtRegex = /@([\w-]+)\s*(?:codeforces|cf)/i

    const email = text.match(emailRegex)?.[0]
    const phone = text.match(phoneRegex)?.[0]
    const linkedin = text.match(linkedinRegex)?.[0]

    let github = null
    const urlMatch = text.match(githubUrlRegex)
    if (urlMatch) {
      github = urlMatch[1]
    } else {
      const labelMatch = text.match(githubLabelRegex)
      if (labelMatch) {
        github = labelMatch[1]
      } else {
        const atMatch = text.match(githubAtRegex)
        if (atMatch) {
          github = atMatch[1]
        }
      }
    }

    let codeforces = null
    const cfUrlMatch = text.match(cfUrlRegex)
    if (cfUrlMatch) {
      codeforces = cfUrlMatch[1]
    } else {
      const cfLabelMatch = text.match(cfLabelRegex)
      if (cfLabelMatch) {
        codeforces = cfLabelMatch[1]
      } else {
        const cfAtMatch = text.match(cfAtRegex)
        if (cfAtMatch) {
          codeforces = cfAtMatch[1]
        }
      }
    }

    const cfClaimedRank = this.extractCodeforcesClaimedRank(text)

    return {
      email,
      phone,
      linkedin,
      github,
      codeforces,
      cfClaimedRank,
    }
  }

  private extractCodeforcesClaimedRank(text: string): string | null {
    if (!text) return null
    const CF_RANKS = [
      'legendary grandmaster',
      'international grandmaster',
      'grandmaster',
      'international master',
      'candidate master',
      'master',
      'expert',
      'specialist',
      'pupil',
      'newbie',
    ]

    const lowerText = text.toLowerCase()
    const cfIdx = lowerText.indexOf('codeforces')
    if (cfIdx !== -1) {
      const window = lowerText.substring(Math.max(0, cfIdx - 80), cfIdx + 120)
      for (const rank of CF_RANKS) {
        if (window.includes(rank)) {
          return rank
        }
      }
    }

    if (cfIdx !== -1) {
      for (const rank of CF_RANKS) {
        if (lowerText.includes(rank)) {
          return rank
        }
      }
    }

    return null
  }

  extractSections(text: string) {
    const sections: Record<string, string> = {}

    const sectionPatterns: Record<string, RegExp> = {
      skills: /skills[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      experience: /experience[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      education: /education[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      projects: /projects[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      certifications: /certifications[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    }

    Object.keys(sectionPatterns).forEach((key) => {
      const match = text.match(sectionPatterns[key])
      sections[key] = match ? match[1].trim() : ''
    })

    return sections
  }
}

export const parserService = new ParserService()
