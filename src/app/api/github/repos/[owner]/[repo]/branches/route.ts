import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import { listBranches, createBranch, deleteBranch } from "@/lib/github";
import { logActivity } from "@/lib/activity-log";

type P = { params: Promise<{ owner: string; repo: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const data = await listBranches(token, owner, repo);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const { branch, from } = await req.json();
    if (!branch || !from) throw new Error("branch and from are required");
    const data = await createBranch(token, owner, repo, branch, from);
    await logActivity({
      type: "branch",
      action: "create",
      status: "success",
      repo: `${owner}/${repo}`,
      payload: { branch, from },
    });
    return ok(data, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const { branch } = await req.json();
    await deleteBranch(token, owner, repo, branch);
    await logActivity({
      type: "branch",
      action: "delete",
      status: "success",
      repo: `${owner}/${repo}`,
      payload: { branch },
    });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
