import { NextRequest } from 'next/server'
import { requireToken, ok, handleError, paginate } from '@/lib/api'
import { listIssues, createIssue, getIssue, updateIssue, addIssueComment, listIssueComments } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const state = (url.searchParams.get('state') || 'open') as any
    const labels = url.searchParams.get('labels') || undefined
    const assignee = url.searchParams.get('assignee') || undefined
    const { page, per_page } = paginate(req)
    const data = await listIssues(token, params.owner, params.repo, { state, labels, assignee, per_page, page })
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const data = await createIssue(token, params.owner, params.repo, body)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
