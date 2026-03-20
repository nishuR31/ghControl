import { Queue, Worker, QueueEvents } from "bullmq";
import { getRedisConnectionOptions } from "./redis";

const connection = getRedisConnectionOptions();

// ── Queue names ────────────────────────────────────────────────────────────
export const QUEUES = {
  GITHUB_OPS: "github-ops",
  WEBHOOK_PROC: "webhook-processor",
  REPO_SYNC: "repo-sync",
  NOTIFS: "notifications",
} as const;

// ── Queues ─────────────────────────────────────────────────────────────────
export const githubOpsQueue = new Queue(QUEUES.GITHUB_OPS, { connection });
export const webhookQueue = new Queue(QUEUES.WEBHOOK_PROC, { connection });
export const repoSyncQueue = new Queue(QUEUES.REPO_SYNC, { connection });
export const notifsQueue = new Queue(QUEUES.NOTIFS, { connection });

// ── Job types ──────────────────────────────────────────────────────────────
export type GithubOpJob =
  | { type: "sync_repos"; token: string; userId: string }
  | { type: "sync_issues"; token: string; owner: string; repo: string }
  | {
      type: "create_issue";
      token: string;
      owner: string;
      repo: string;
      title: string;
      body?: string;
      labels?: string[];
    }
  | {
      type: "close_issue";
      token: string;
      owner: string;
      repo: string;
      number: number;
    }
  | {
      type: "merge_pr";
      token: string;
      owner: string;
      repo: string;
      number: number;
      method?: string;
    }
  | {
      type: "create_branch";
      token: string;
      owner: string;
      repo: string;
      branch: string;
      from: string;
    }
  | {
      type: "delete_branch";
      token: string;
      owner: string;
      repo: string;
      branch: string;
    }
  | {
      type: "create_release";
      token: string;
      owner: string;
      repo: string;
      tag: string;
      name: string;
      body?: string;
      draft?: boolean;
      prerelease?: boolean;
    }
  | {
      type: "create_repo";
      token: string;
      name: string;
      description?: string;
      private?: boolean;
      autoInit?: boolean;
    }
  | { type: "delete_repo"; token: string; owner: string; repo: string }
  | {
      type: "fork_repo";
      token: string;
      owner: string;
      repo: string;
      org?: string;
    }
  | { type: "star_repo"; token: string; owner: string; repo: string }
  | { type: "unstar_repo"; token: string; owner: string; repo: string };

// ── Enqueue helpers ────────────────────────────────────────────────────────
export async function enqueueGithubOp(job: GithubOpJob, opts?: object) {
  return githubOpsQueue.add(job.type, job, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
    ...opts,
  });
}

export async function enqueueRepoSync(token: string, userId: string) {
  return repoSyncQueue.add(
    "sync",
    { token, userId },
    {
      jobId: `sync-${userId}`, // deduplicate
      attempts: 2,
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  );
}
