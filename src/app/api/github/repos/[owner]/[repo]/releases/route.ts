import { NextRequest } from "next/server";
import { requireToken, ok, handleError } from "@/lib/api";
import { listReleases, createRelease } from "@/lib/github";

type P = { params: Promise<{ owner: string; repo: string }> };

export async function GET(req: NextRequest, { params }: P) {
  try {
    const token = requireToken(req);
    const { owner, repo } = await params;
    const data = await listReleases(token, owner, repo);
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
    const data = await createRelease(token, owner, repo, body);
    return ok(data, 201);
  } catch (e) {
    return handleError(e);
  }
}
