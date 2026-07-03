import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { parserService } from '@/lib/parserService'
import connectDB from '@/lib/mongodb'
import Resume from '@/models/Resume'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const formData = await req.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const fileExtension = path.extname(file.name).toLowerCase()
    if (fileExtension !== '.pdf' && fileExtension !== '.txt') {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Use PDF or TXT.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads')
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Create uploads directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    await writeFile(filePath, buffer)

    const text = await parserService.parseResume(filePath)
    const contactInfo = parserService.extractContactInfo(text)
    const sections = parserService.extractSections(text)

    const resumeId = uuidv4()

    const resume = await Resume.create({
      resumeId,
      text,
      contactInfo,
      sections,
      githubUsername: contactInfo.github,
      codeforcesHandle: contactInfo.codeforces,
      parsedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: {
        resumeId,
        text,
        contactInfo,
        sections,
        githubUsername: contactInfo.github,
        codeforcesHandle: contactInfo.codeforces,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
