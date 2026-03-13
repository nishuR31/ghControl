import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { getIssue, updateIssue, addIssueComment, listIssueComments } from '@/lib/github'

type P = { params: { owner: string; repo: string; number: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const num = parseInt(params.number)
    if (url.searchParams.get('comments') === '1') {
      const data = await listIssueComments(token, params.owner, params.repo, num)
      return ok(data)
    }
    const data = await getIssue(token, params.owner, params.repo, num)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const data = await updateIssue(token, params.owner, params.repo, parseInt(params.number), body)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { body } = await req.json()
    const data = await addIssueComment(token, params.owner, params.repo, parseInt(params.number), body)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
