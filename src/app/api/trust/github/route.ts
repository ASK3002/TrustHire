import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/githubService'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'GitHub username is required' },
        { status: 400 }
      )
    }

    const githubData = await githubService.fetchLightweightData(username)

    return NextResponse.json({
      success: true,
      data: githubData,
    })
  } catch (error) {
    console.error('GitHub error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}
