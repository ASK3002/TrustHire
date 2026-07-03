import axios from 'axios'

const RANK_TIERS = [
  'newbie',
  'pupil',
  'specialist',
  'expert',
  'candidate master',
  'master',
  'international master',
  'grandmaster',
  'international grandmaster',
  'legendary grandmaster',
]

class CodeforcesService {
  private baseURL = 'https://codeforces.com/api'

  private getRankTier(rankStr: string): number {
    if (!rankStr) return -1
    const normalized = rankStr.toLowerCase().trim()
    const idx = RANK_TIERS.indexOf(normalized)
    return idx
  }

  async fetchUserData(handle: string) {
    try {
      if (!handle) return null

      console.log(`\n🏆 ===== CODEFORCES LOOKUP =====`)
      console.log(`   Handle: ${handle}`)

      const response = await axios.get(`${this.baseURL}/user.info`, {
        params: { handles: handle },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000,
      })

      if (response.data?.status !== 'OK' || !response.data?.result?.length) {
        console.warn(`⚠️  [Codeforces] No user found for handle: ${handle}`)
        return null
      }

      const user = response.data.result[0]

      const result = {
        handle: user.handle,
        maxRating: user.maxRating ?? null,
        maxRank: user.maxRank ?? null,
        currentRating: user.rating ?? null,
        currentRank: user.rank ?? null,
        titlePhoto: user.titlePhoto ?? null,
      }

      console.log(`   Max Rating : ${result.maxRating}`)
      console.log(`   Max Rank   : ${result.maxRank}`)
      console.log(`================================\n`)

      return result
    } catch (error) {
      if ((error as any).response?.status === 400) {
        console.warn(`⚠️  [Codeforces] Invalid handle: ${handle}`)
      } else {
        console.error(`❌ [Codeforces] API error: ${error}`)
      }
      return null
    }
  }

  verifyRank(claimedRank: string, codeforcesData: any) {
    if (!claimedRank || !codeforcesData?.maxRank) {
      return { verified: null }
    }

    const claimedTier = this.getRankTier(claimedRank)
    const actualTier = this.getRankTier(codeforcesData.maxRank)

    if (claimedTier === -1 || actualTier === -1) {
      console.warn(`⚠️  [Codeforces] Could not compare ranks`)
      return { verified: null }
    }

    if (actualTier >= claimedTier) {
      console.log(`✅ [Codeforces] Rank VERIFIED`)
      return { verified: true }
    } else {
      const flag = `Codeforces rank mismatch: resume claims "${claimedRank}" but actual max rank is "${codeforcesData.maxRank}"`
      console.warn(`🚩 [Codeforces] Rank MISMATCH: ${flag}`)
      return { verified: false, flag }
    }
  }
}

export const codeforcesService = new CodeforcesService()
