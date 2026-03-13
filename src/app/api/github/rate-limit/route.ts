import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { getRateLimit } from '@/lib/github'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const data = await getRateLimit(token)
    return ok(data)
  } catch (e) { return handleError(e) }
}
