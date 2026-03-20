import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import { listRepos, createRepo } from "@/lib/github";
import { cacheGet, cacheSet, cacheDelPattern } from "@/lib/redis";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  try {
    const token = requireToken(req);
    const url = new URL(req.url);
    const sort = (url.searchParams.get("sort") || "updated") as any;
    const type = (url.searchParams.get("type") || "all") as any;
    const cacheKey = `repos:${token.slice(-8)}:${sort}:${type}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return ok(cached);
    const repos = await listRepos(token, { sort, type, per_page: 100 });
    await cacheSet(cacheKey, repos, 120);
    return ok(repos);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = requireToken(req);
    const body = await req.json();
    const repo = await createRepo(token, body);

    await cacheDelPattern(`repos:${token.slice(-8)}:*`);
    await logActivity({
      type: "repo",
      action: "create",
      status: "success",
      repo: repo.full_name,
      payload: {
        name: repo.name,
        private: repo.private,
        html_url: repo.html_url,
      },
    });

    return ok(repo, 201);
  } catch (e) {
    return handleError(e);
  }
}
