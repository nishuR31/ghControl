import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import {
  getIssue,
  updateIssue,
  addIssueComment,
  listIssueComments,
} from "@/lib/github";

type P = { params: Promise<{ owner: string; repo: string; number: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo, number } = await params;
    const url = new URL(req.url);
    const num = parseInt(number);
    if (url.searchParams.get("comments") === "1") {
      const data = await listIssueComments(token, owner, repo, num);
      return ok(data);
    }
    const data = await getIssue(token, owner, repo, num);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo, number } = await params;
    const body = await req.json();
    const data = await updateIssue(token, owner, repo, parseInt(number), body);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo, number } = await params;
    const { body } = await req.json();
    const data = await addIssueComment(
      token,
      owner,
      repo,
      parseInt(number),
      body,
    );
    return ok(data, 201);
  } catch (e) {
    return handleError(e);
  }
}
