import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listLabels, createLabel } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const data = await listLabels(token, params.owner, params.repo)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { name, color, description } = await req.json()
    const data = await createLabel(token, params.owner, params.repo, name, color, description)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
