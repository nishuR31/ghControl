import { NextRequest } from "next/server";
import { requireToken, ok, handleError, err } from "@/lib/api";
import { enqueueGithubOp, githubOpsQueue } from "@/lib/queues";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const statusMap: Record<string, string[]> = {
      pending: ["waiting", "delayed", "paused"],
      active: ["active"],
      completed: ["completed"],
      failed: ["failed"],
    };

    const states =
      status ?
        ((statusMap[status] || [
          "waiting",
          "active",
          "completed",
          "failed",
        ]) as any)
      : ([
          "waiting",
          "active",
          "completed",
          "failed",
          "delayed",
          "paused",
        ] as any);

    const jobs = await githubOpsQueue.getJobs(states, 0, 49, true);
    const mapped = jobs.map((job) => {
      const startedAt =
        job.processedOn ? new Date(job.processedOn).toISOString() : undefined;
      const finishedAt =
        job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined;
      let normalized = "pending";
      if (job.finishedOn && job.failedReason) normalized = "failed";
      else if (job.finishedOn) normalized = "completed";
      else if (job.processedOn) normalized = "active";

      return {
        _id: String(job.id),
        jobId: String(job.id),
        queue: "github-ops",
        type: job.name,
        status: normalized,
        createdAt: new Date(job.timestamp).toISOString(),
        startedAt,
        finishedAt,
        error: job.failedReason || undefined,
      };
    });

    return ok(mapped);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req);
    const body = await req.json();
    const { type, ...rest } = body;
    if (!type) return err("job type is required", 400);
    const job = await enqueueGithubOp({ type, token, ...rest } as any);

    await logActivity({
      type: "job",
      action: type,
      status: "queued",
      repo: rest.owner && rest.repo ? `${rest.owner}/${rest.repo}` : undefined,
      payload: { queue: "github-ops", jobId: String(job.id), input: rest },
    });

    return ok({ jobId: job.id, type }, 202);
  } catch (e) {
    return handleError(e);
  }
}
