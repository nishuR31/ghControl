import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { getRecentActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const event = url.searchParams.get("event") || "";
    const rows = await getRecentActivity({ type: event });
    const events = rows.map((row: any) => ({
      _id: row.id,
      event: row.type,
      repository: row.repo,
      sender: row.actor,
      action: row.action,
      payload: row.payload,
      receivedAt: row.createdAt,
      source: row.source,
      status: row.status,
    }));
    return ok(events);
  } catch (e) {
    return handleError(e);
  }
}
