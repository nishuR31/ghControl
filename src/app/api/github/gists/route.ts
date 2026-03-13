import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listGists, createGist } from '@/lib/github'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const data = await listGists(token)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req)
    const { description, files, public: isPublic } = await req.json()
    const data = await createGist(token, description, files, isPublic)
    return ok(data, 201)
  } catch (e) { return handleError(e) }
}
