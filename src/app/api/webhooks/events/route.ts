import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { WebhookEvent } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const url = new URL(req.url)
    const event = url.searchParams.get('event')
    const repo = url.searchParams.get('repo')
    const filter: Record<string, unknown> = {}
    if (event) filter.event = event
    if (repo) filter.repository = repo
    const events = await WebhookEvent.find(filter).sort({ receivedAt: -1 }).limit(100).lean()
    return ok(events)
  } catch (e) { return handleError(e) }
}
