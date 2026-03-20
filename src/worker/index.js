// Run with: node src/worker/index.js (or npm run worker)
require("dotenv").config();

const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { Octokit } = require("@octokit/rest");

function envFlag(name) {
  const value = process.env[name];
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes")
    return true;
  if (normalized === "0" || normalized === "false" || normalized === "no")
    return false;
  return null;
}

function resolveTlsConfig(redisUrl) {
  let tlsByUrl = false;
  try {
    tlsByUrl = new URL(redisUrl).protocol === "rediss:";
  } catch {
    tlsByUrl = String(redisUrl).startsWith("rediss://");
  }
  const tlsByEnv = envFlag("REDIS_TLS");
  const shouldUseTls = tlsByEnv ?? tlsByUrl;
  if (!shouldUseTls) return undefined;

  const rejectUnauthorized = envFlag("REDIS_TLS_REJECT_UNAUTHORIZED");
  if (rejectUnauthorized === false) return { rejectUnauthorized: false };
  return {};
}

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const connection = {
  url: redisUrl,
  tls: resolveTlsConfig(redisUrl),
  maxRetriesPerRequest: null,
  connectTimeout: 8000,
};
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gh-control";
const ENABLE_WORKER_MONGO_LOG = envFlag("WORKER_MONGO_LOG") === true;

let JobLog = null;

const JobLogSchema = new mongoose.Schema(
  {
    jobId: String,
    queue: String,
    type: String,
    status: { type: String, default: "pending" },
    data: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed,
    error: String,
    startedAt: Date,
    finishedAt: Date,
  },
  { timestamps: true },
);

if (ENABLE_WORKER_MONGO_LOG) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("[Worker] MongoDB connected (job logging enabled)"))
    .catch((err) =>
      console.error("[Worker] MongoDB connect error:", err.message),
    );

  JobLog = mongoose.models.JobLog || mongoose.model("JobLog", JobLogSchema);
}

// ── Helper ─────────────────────────────────────────────────────────────────
function gh(token) {
  return new Octokit({ auth: token });
}

// ── Job processor ──────────────────────────────────────────────────────────
async function processGithubJob(job) {
  const { type, token, ...data } = job.data;
  console.log(`[Worker] Processing job: ${type} (${job.id})`);

  const octokit = gh(token);

  switch (type) {
    case "sync_repos": {
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        per_page: 100,
      });
      return { count: repos.length, repos: repos.map((r) => r.full_name) };
    }
    case "create_issue": {
      const { owner, repo, title, body, labels, assignees } = data;
      const { data: issue } = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
        assignees,
      });
      return { number: issue.number, url: issue.html_url };
    }
    case "close_issue": {
      const { owner, repo, number } = data;
      await octokit.issues.update({
        owner,
        repo,
        issue_number: number,
        state: "closed",
      });
      return { closed: true };
    }
    case "merge_pr": {
      const { owner, repo, number, method = "merge" } = data;
      const { data: result } = await octokit.pulls.merge({
        owner,
        repo,
        pull_number: number,
        merge_method: method,
      });
      return { merged: result.merged, sha: result.sha };
    }
    case "create_branch": {
      const { owner, repo, branch, from } = data;
      const { data: ref } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${from}`,
      });
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: ref.object.sha,
      });
      return { created: true, branch };
    }
    case "delete_branch": {
      const { owner, repo, branch } = data;
      await octokit.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
      return { deleted: true, branch };
    }
    case "create_release": {
      const {
        owner,
        repo,
        tag,
        name,
        body: releaseBody,
        draft,
        prerelease,
      } = data;
      const { data: release } = await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tag,
        name,
        body: releaseBody,
        draft,
        prerelease,
      });
      return { id: release.id, url: release.html_url };
    }
    case "create_repo": {
      const { name, description, private: isPrivate, autoInit } = data;
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: autoInit,
      });
      return { fullName: repo.full_name, url: repo.html_url };
    }
    case "delete_repo": {
      const { owner, repo } = data;
      await octokit.repos.delete({ owner, repo });
      return { deleted: true };
    }
    case "fork_repo": {
      const { owner, repo, org } = data;
      const { data: fork } = await octokit.repos.createFork({
        owner,
        repo,
        organization: org,
      });
      return { fullName: fork.full_name };
    }
    case "star_repo": {
      const { owner, repo } = data;
      await octokit.activity.starRepoForAuthenticatedUser({ owner, repo });
      return { starred: true };
    }
    case "unstar_repo": {
      const { owner, repo } = data;
      await octokit.activity.unstarRepoForAuthenticatedUser({ owner, repo });
      return { unstarred: true };
    }
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

// ── Workers ────────────────────────────────────────────────────────────────
const githubWorker = new Worker(
  "github-ops",
  async (job) => {
    if (JobLog) {
      await JobLog.findOneAndUpdate(
        { jobId: job.id },
        {
          jobId: job.id,
          queue: "github-ops",
          type: job.data.type,
          status: "active",
          startedAt: new Date(),
          data: job.data,
        },
        { upsert: true },
      );
    }
    try {
      const result = await processGithubJob(job);
      if (JobLog) {
        await JobLog.findOneAndUpdate(
          { jobId: job.id },
          { status: "completed", result, finishedAt: new Date() },
        );
      }
      return result;
    } catch (e) {
      if (JobLog) {
        await JobLog.findOneAndUpdate(
          { jobId: job.id },
          { status: "failed", error: e.message, finishedAt: new Date() },
        );
      }
      throw e;
    }
  },
  { connection, concurrency: 5 },
);

const repoSyncWorker = new Worker(
  "repo-sync",
  async (job) => {
    const { token, userId } = job.data;
    const octokit = gh(token);
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
    });
    console.log(`[Worker] Synced ${repos.length} repos for ${userId}`);
    return { count: repos.length };
  },
  { connection },
);

const webhookWorker = new Worker(
  "webhook-processor",
  async (job) => {
    const { event, payload } = job.data;
    console.log(
      `[Worker] Processing webhook: ${event} - ${payload?.repository?.full_name}`,
    );
    // Add automation rules processing here
    return { processed: true };
  },
  { connection },
);

// ── Event handlers ─────────────────────────────────────────────────────────
for (const worker of [githubWorker, repoSyncWorker, webhookWorker]) {
  worker.on("completed", (job) =>
    console.log(`[Worker] ✓ ${job.name} (${job.id})`),
  );
  worker.on("failed", (job, err) =>
    console.error(`[Worker] ✗ ${job?.name} (${job?.id}): ${err.message}`),
  );
}

console.log(
  "🔧 GH Control Worker started — listening on github-ops, repo-sync, webhook-processor",
);
