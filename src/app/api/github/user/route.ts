import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { getUser } from '@/lib/github'
import { cacheGet, cacheSet } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const cacheKey = `user:${token.slice(-8)}`
    const cached = await cacheGet(cacheKey)
    if (cached) return ok(cached)
    const user = await getUser(token)
    await cacheSet(cacheKey, user, 300)
    return ok(user)
  } catch (e) { return handleError(e) }
}
