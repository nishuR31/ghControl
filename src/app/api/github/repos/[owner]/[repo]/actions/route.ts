import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import {
  listWorkflows,
  listWorkflowRuns,
  triggerWorkflow,
  cancelWorkflowRun,
  rerunWorkflow,
} from "@/lib/github";

type P = { params: Promise<{ owner: string; repo: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const url = new URL(req.url);
    const workflowId = url.searchParams.get("workflow_id") || undefined;
    const runs = url.searchParams.get("runs");
    if (runs === "1") {
      const data = await listWorkflowRuns(token, owner, repo, workflowId);
      return ok(data);
    }
    const data = await listWorkflows(token, owner, repo);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const { workflow_id, ref, inputs, action, run_id } = await req.json();
    if (action === "cancel") {
      await cancelWorkflowRun(token, owner, repo, run_id);
      return ok({ cancelled: true });
    }
    if (action === "rerun") {
      await rerunWorkflow(token, owner, repo, run_id);
      return ok({ rerun: true });
    }
    await triggerWorkflow(token, owner, repo, workflow_id, ref, inputs);
    return ok({ triggered: true });
  } catch (e) {
    return handleError(e);
  }
}
