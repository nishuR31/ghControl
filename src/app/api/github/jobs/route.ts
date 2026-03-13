import { NextRequest } from 'next/server'
import { requireToken, ok, handleError, err } from '@/lib/api'
import { enqueueGithubOp } from '@/lib/queues'
import { connectDB } from '@/lib/mongodb'
import { JobLog } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const url = new URL(req.url)
    const queue = url.searchParams.get('queue')
    const status = url.searchParams.get('status')
    const filter: Record<string, string> = {}
    if (queue) filter.queue = queue
    if (status) filter.status = status
    const jobs = await JobLog.find(filter).sort({ createdAt: -1 }).limit(50).lean()
    return ok(jobs)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req)
    const body = await req.json()
    const { type, ...rest } = body
    if (!type) return err('job type is required', 400)
    const job = await enqueueGithubOp({ type, token, ...rest } as any)
    return ok({ jobId: job.id, type }, 202)
  } catch (e) { return handleError(e) }
}
