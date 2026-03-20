import { NextRequest, NextResponse } from "next/server";
import { webhookQueue } from "@/lib/queues";
import { logActivity } from "@/lib/activity-log";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "GitHub webhook receiver is live. Send POST requests from GitHub webhooks to this URL.",
    endpoint: "/api/webhooks/receive",
    methods: ["POST"],
  });
}

export async function POST(req: NextRequest) {
  const event = req.headers.get("x-github-event") || "unknown";
  const delivery =
    req.headers.get("x-github-delivery") || `manual-${Date.now()}`;
  const signature = req.headers.get("x-hub-signature-256");

  const body = await req.text();

  // Verify signature if secret set
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret && signature) {
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: any = {};
  try {
    payload = JSON.parse(body);
  } catch {
    /* raw */
  }

  try {
    // Queue for processing
    await webhookQueue.add(
      event,
      { eventId: delivery, event, payload },
      {
        attempts: 2,
        removeOnComplete: 200,
        removeOnFail: 100,
      },
    );

    const logExternal =
      (process.env.LOG_EXTERNAL_WEBHOOKS || "false").toLowerCase() === "true";
    if (logExternal) {
      await logActivity({
        source: "external",
        type: `webhook:${event}`,
        action: payload.action || "received",
        status: "success",
        repo: payload.repository?.full_name,
        actor: payload.sender?.login,
        payload: {
          delivery,
          repository: payload.repository?.full_name,
          sender: payload.sender?.login,
          action: payload.action,
        },
      });
    }
  } catch (e) {
    console.error("[Webhook] processing error:", e);
  }

  return NextResponse.json({ received: true, event, delivery });
}
