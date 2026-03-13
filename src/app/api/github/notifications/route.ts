import { NextRequest } from 'next/server'
import { requireToken, ok, handleError } from '@/lib/api'
import { listNotifications, markNotificationsRead } from '@/lib/github'

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req)
    const data = await listNotifications(token)
    return ok(data)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req)
    const { action } = await req.json()
    if (action === 'mark_read') {
      await markNotificationsRead(token)
      return ok({ marked: true })
    }
    return ok({})
  } catch (e) { return handleError(e) }
}
