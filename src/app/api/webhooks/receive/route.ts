import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { WebhookEvent } from '@/lib/models'
import { webhookQueue } from '@/lib/queues'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const event = req.headers.get('x-github-event') || 'unknown'
  const delivery = req.headers.get('x-github-delivery') || `manual-${Date.now()}`
  const signature = req.headers.get('x-hub-signature-256')

  const body = await req.text()

  // Verify signature if secret set
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (secret && signature) {
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: any = {}
  try { payload = JSON.parse(body) } catch { /* raw */ }

  try {
    await connectDB()
    const doc = await WebhookEvent.findOneAndUpdate(
      { delivery },
      {
        delivery, event,
        repository: payload.repository?.full_name,
        sender: payload.sender?.login,
        action: payload.action,
        payload,
        receivedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // Queue for processing
    await webhookQueue.add(event, { eventId: doc._id.toString(), event, payload }, {
      attempts: 2,
      removeOnComplete: 200,
      removeOnFail: 100,
    })
  } catch (e) {
    console.error('[Webhook] DB error:', e)
  }

  return NextResponse.json({ received: true, event, delivery })
}
