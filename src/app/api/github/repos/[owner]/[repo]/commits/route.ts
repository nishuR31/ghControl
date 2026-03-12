import { NextRequest } from 'next/server'
import { requireToken, ok, handleError, paginate } from '@/lib/api'
import { listCommits, compareCommits } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const url = new URL(req.url)
    const { page, per_page } = paginate(req)
    const sha = url.searchParams.get('sha') || undefined
    const path = url.searchParams.get('path') || undefined
    const author = url.searchParams.get('author') || undefined
    const compare = url.searchParams.get('compare')
    if (compare) {
      const [base, head] = compare.split('...')
      const data = await compareCommits(token, params.owner, params.repo, base, head)
      return ok(data)
    }
    const data = await listCommits(token, params.owner, params.repo, { sha, path, author, per_page, page })
    return ok(data)
  } catch (e) { return handleError(e) }
}
