import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listHooks, createHook, deleteHook, pingHook } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const data = await listHooks(token, params.owner, params.repo)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { url, events, secret, action, hook_id } = await req.json()
    if (action === 'ping' && hook_id) {
      await pingHook(token, params.owner, params.repo, hook_id)
      return ok({ pinged: true })
    }
    if (action === 'delete' && hook_id) {
      await deleteHook(token, params.owner, params.repo, hook_id)
      return ok({ deleted: true })
    }
    if (!url) throw new Error('url is required')
    const data = await createHook(token, params.owner, params.repo, url, events || ['push', 'pull_request', 'issues'], secret)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
