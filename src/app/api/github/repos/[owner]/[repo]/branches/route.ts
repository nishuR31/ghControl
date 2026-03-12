import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listBranches, createBranch, deleteBranch } from '@/lib/github'

type P = { params: { owner: string; repo: string } }

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const data = await listBranches(token, params.owner, params.repo)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { branch, from } = await req.json()
    if (!branch || !from) throw new Error('branch and from are required')
    const data = await createBranch(token, params.owner, params.repo, branch, from)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req)
    const { branch } = await req.json()
    await deleteBranch(token, params.owner, params.repo, branch)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
