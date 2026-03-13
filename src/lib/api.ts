import { NextRequest, NextResponse } from 'next/server'

export function getToken(req: NextRequest): string | null {
  return req.headers.get('x-github-token') || req.headers.get('authorization')?.replace('Bearer ', '') || null
}

export function requireToken(req: NextRequest): string {
  const token = getToken(req)
  if (!token) throw new ApiError(401, 'GitHub token required (x-github-token header)')
  return token
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function handleError(e: unknown) {
  if (e instanceof ApiError) return err(e.message, e.status)
  const msg = (e as any)?.response?.data?.message || (e as Error)?.message || 'Internal error'
  const status = (e as any)?.status || 500
  return err(msg, status)
}

export function paginate(req: NextRequest) {
  const url = new URL(req.url)
  return {
    page: parseInt(url.searchParams.get('page') || '1'),
    per_page: parseInt(url.searchParams.get('per_page') || '30'),
  }
}
