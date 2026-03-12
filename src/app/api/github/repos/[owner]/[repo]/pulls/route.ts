import { NextRequest } from 'next/server'
import { requireToken, ok, handleError, paginate } from '@/lib/api'
import { listPulls, createPull, getPull, mergePull, listPullReviews, createReviewComment } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const state = (url.searchParams.get('state') || 'open') as any
    const base = url.searchParams.get('base') || undefined
    const { page, per_page } = paginate(req)
    const data = await listPulls(token, params.owner, params.repo, { state, base, per_page, page })
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const data = await createPull(token, params.owner, params.repo, body)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
