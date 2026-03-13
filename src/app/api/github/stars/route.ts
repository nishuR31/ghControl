import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listStarred, starRepo, unstarRepo } from '@/lib/github'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const data = await listStarred(token)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req)
    const { owner, repo, action } = await req.json()
    if (action === 'unstar') {
      await unstarRepo(token, owner, repo)
      return ok({ unstarred: true })
    }
    await starRepo(token, owner, repo)
    return ok({ starred: true })
  } catch (e) { return handleError(e) }
}
