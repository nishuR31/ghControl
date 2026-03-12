import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { getRepo, updateRepo, deleteRepo, forkRepo } from '@/lib/github'
import { cacheGet, cacheSet } from '@/lib/redis'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { owner, repo } = params
    const cacheKey = `repo:${owner}/${repo}`
    const cached = await cacheGet(cacheKey)
    if (cached) return ok(cached)
    const data = await getRepo(token, owner, repo)
    await cacheSet(cacheKey, data, 180)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const data = await updateRepo(token, params.owner, params.repo, body)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    await deleteRepo(token, params.owner, params.repo)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
