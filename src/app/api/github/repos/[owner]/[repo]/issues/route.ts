import { NextRequest } from "next/server";
import { requireToken, ok, handleError, paginate } from "@/lib/api";
import {
  listIssues,
  createIssue,
  getIssue,
  updateIssue,
  addIssueComment,
  listIssueComments,
} from "@/lib/github";
import { logActivity } from "@/lib/activity-log";

type P = { params: Promise<{ owner: string; repo: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const url = new URL(req.url);
    const state = (url.searchParams.get("state") || "open") as any;
    const labels = url.searchParams.get("labels") || undefined;
    const assignee = url.searchParams.get("assignee") || undefined;
    const { page, per_page } = paginate(req);
    const data = await listIssues(token, owner, repo, {
      state,
      labels,
      assignee,
      per_page,
      page,
    });
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const body = await req.json();
    const data = await createIssue(token, owner, repo, body);

    await logActivity({
      type: "issue",
      action: "create",
      status: "success",
      repo: `${owner}/${repo}`,
      payload: { number: data.number, title: data.title, url: data.html_url },
    });

    return ok(data, 201);
  } catch (e) {
    return handleError(e);
  }
}
