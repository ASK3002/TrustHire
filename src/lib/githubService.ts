import axios from 'axios'

class GitHubService {
  private baseURL = 'https://api.github.com'
  private token = process.env.GITHUB_TOKEN
  private headers = {
    Authorization: `token ${this.token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  async fetchLightweightData(username: string) {
    try {
      if (!this.token) {
        console.warn('⚠️ GITHUB_TOKEN not configured')
        return this.getMockLightweightData(username)
      }

      // Fetch user profile only
      const userResponse = await axios.get(
        `${this.baseURL}/users/${username}`,
        { headers: this.headers }
      )

      const userData = userResponse.data

      // Fetch user repos (only basic info, no details)
      const reposResponse = await axios.get(
        `${this.baseURL}/users/${username}/repos`,
        {
          headers: this.headers,
          params: { per_page: 100, sort: 'updated' },
        }
      )

      const repos = reposResponse.data

      // Extract languages from repos (lightweight)
      const languages = this.extractLanguages(repos)

      return {
        username: userData.login,
        name: userData.name,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        created_at: userData.created_at,
        languages,
        yearsSinceCreated: this.calculateYearsSince(userData.created_at),
      }
    } catch (error) {
      console.error('GitHub API error:', error)
      return this.getMockLightweightData(username)
    }
  }

  private extractLanguages(repos: any[]): string[] {
    const languageMap: Record<string, number> = {}

    for (const repo of repos) {
      if (!repo.language) continue

      if (!languageMap[repo.language]) {
        languageMap[repo.language] = 0
      }
      languageMap[repo.language] += 1
    }

    return Object.keys(languageMap)
      .sort((a, b) => languageMap[b] - languageMap[a])
      .slice(0, 10)
  }

  private calculateYearsSince(dateString: string): number {
    const created = new Date(dateString)
    const now = new Date()
    return now.getFullYear() - created.getFullYear()
  }

  private getMockLightweightData(username: string) {
    return {
      username,
      name: `${username} (Mock)`,
      publicRepos: 15,
      followers: 42,
      created_at: new Date(2015, 0, 1).toISOString(),
      languages: ['JavaScript', 'Python', 'TypeScript', 'React'],
      yearsSinceCreated: 9,
    }
  }
}

export const githubService = new GitHubService()
