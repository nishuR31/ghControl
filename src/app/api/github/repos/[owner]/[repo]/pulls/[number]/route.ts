import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { getPull, mergePull, listPullReviews, createReviewComment } from '@/lib/github'

type P = { params: { owner: string; repo: string; number: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const num = parseInt(params.number)
    if (url.searchParams.get('reviews') === '1') {
      const data = await listPullReviews(token, params.owner, params.repo, num)
      return ok(data)
    }
    const data = await getPull(token, params.owner, params.repo, num)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function PUT(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const data = await mergePull(token, params.owner, params.repo, parseInt(params.number), body)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { body } = await req.json()
    const data = await createReviewComment(token, params.owner, params.repo, parseInt(params.number), body)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
