import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { searchRepos, searchCode, searchIssues, searchUsers } from '@/lib/github'
import { cacheGet, cacheSet } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const q = url.searchParams.get('q')
    const type = url.searchParams.get('type') || 'repos'
    const sort = url.searchParams.get('sort') as any
    if (!q) throw new Error('q (query) is required')

    const cacheKey = `search:${type}:${q}:${sort}`
    const cached = await cacheGet(cacheKey)
    if (cached) return ok(cached)

    let data
    switch (type) {
      case 'code':   data = await searchCode(token, q); break
      case 'issues': data = await searchIssues(token, q); break
      case 'users':  data = await searchUsers(token, q); break
      default:       data = await searchRepos(token, q, sort); break
    }
    await cacheSet(cacheKey, data, 60)
    return ok(data)
  } catch (e) { return handleError(e) }
}
