import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import { listHooks, createHook, deleteHook, pingHook } from "@/lib/github";
import { logActivity } from "@/lib/activity-log";

type P = { params: Promise<{ owner: string; repo: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const data = await listHooks(token, owner, repo);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const { url, events, secret, action, hook_id } = await req.json();
    if (action === "ping" && hook_id) {
      await pingHook(token, owner, repo, hook_id);
      await logActivity({
        type: "webhook",
        action: "ping",
        status: "success",
        repo: `${owner}/${repo}`,
        payload: { hook_id },
      });
      return ok({ pinged: true });
    }
    if (action === "delete" && hook_id) {
      await deleteHook(token, owner, repo, hook_id);
      await logActivity({
        type: "webhook",
        action: "delete",
        status: "success",
        repo: `${owner}/${repo}`,
        payload: { hook_id },
      });
      return ok({ deleted: true });
    }
    if (!url) throw new Error("url is required");
    const data = await createHook(
      token,
      owner,
      repo,
      url,
      events || ["push", "pull_request", "issues"],
      secret,
    );
    await logActivity({
      type: "webhook",
      action: "create",
      status: "success",
      repo: `${owner}/${repo}`,
      payload: { hook_id: data.id, url: data.config?.url, events: data.events },
    });
    return ok(data, 201);
  } catch (e) {
    return handleError(e);
  }
}
