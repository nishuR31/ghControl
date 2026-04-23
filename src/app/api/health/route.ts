import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getRedis } from "@/lib/redis";

const HEALTH_TIMEOUT_MS = 1200;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateHealthHTML(data: {
  ok: boolean;
  server?: { ok?: boolean; uptimeMs?: number; timestamp?: string };
  redis?: { ok?: boolean; reachable?: boolean; reason?: string };
  database?: { ok?: boolean; connected?: boolean; reason?: string };
}) {
  const getStatusColor = (ok?: boolean) => (ok ? "#22c55e" : "#ef4444");
  const getStatusText = (ok?: boolean) => (ok ? "Connected" : "Disconnected");
  const timestamp = new Date().toISOString();
  const uptime =
    data.server?.uptimeMs ? Math.floor(data.server.uptimeMs / 1000) : 0;
  const redisReason = data.redis?.reason ? escapeHtml(data.redis.reason) : "";
  const databaseReason =
    data.database?.reason ? escapeHtml(data.database.reason) : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GH Control - Health Status</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #0a0b0f;
      color: #f1f2f6;
      line-height: 1.6;
      padding: 24px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 32px;
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #a855f7;
    }

    .status-badge.ok {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .status-badge.error {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .card {
      background: #12141c;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 20px;
      transition: border-color 0.2s ease;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.12);
    }

    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: #8890a4;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }

    .card-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .metric {
      flex: 1;
    }

    .metric-label {
      font-size: 12px;
      color: #8890a4;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 16px;
      font-weight: 700;
      color: #f1f2f6;
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 12px 0;
    }

    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }

    .meta-item {
      padding: 8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
    }

    .meta-label {
      font-size: 11px;
      color: #8890a4;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 13px;
      color: #f1f2f6;
      font-family: 'Courier New', monospace;
    }

    .error-msg {
      margin-top: 8px;
      padding: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 4px;
      color: #fca5a5;
      font-size: 12px;
    }

    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 12px;
      color: #8890a4;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>System Health</h1>
      <span class="status-badge ${data.ok ? "ok" : "error"}">
        <span class="dot" style="background: ${getStatusColor(data.ok)};"></span>
        ${data.ok ? "All Systems Operational" : "System Issues Detected"}
      </span>
    </header>

    <div class="status-grid">
      <!-- Server Status -->
      <div class="card">
        <div class="card-title">🖥️ Server</div>
        <div class="card-status">
          <div class="metric">
            <div class="metric-label">Status</div>
            <div class="metric-value" style="color: ${getStatusColor(data.server?.ok)}">
              ${getStatusText(data.server?.ok)}
            </div>
          </div>
          <span class="status-indicator" style="background: ${getStatusColor(data.server?.ok)};"></span>
        </div>
        <div class="divider"></div>
        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Uptime</div>
            <div class="meta-value">${uptime}s</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Time</div>
            <div class="meta-value">${timestamp.split("T")[1].split(".")[0]}</div>
          </div>
        </div>
      </div>

      <!-- Redis Status -->
      <div class="card">
        <div class="card-title">⚡ Redis</div>
        <div class="card-status">
          <div class="metric">
            <div class="metric-label">Status</div>
            <div class="metric-value" style="color: ${getStatusColor(data.redis?.ok)}">
              ${getStatusText(data.redis?.ok)}
            </div>
          </div>
          <span class="status-indicator" style="background: ${getStatusColor(data.redis?.ok)};"></span>
        </div>
        <div class="divider"></div>
        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Reachable</div>
            <div class="meta-value">${data.redis?.reachable ? "Yes" : "No"}</div>
          </div>
          ${redisReason ? `<div class="meta-item"><div class="meta-label">Reason</div><div class="meta-value">${redisReason}</div></div>` : ""}
        </div>
      </div>

      <!-- Database Status -->
      <div class="card">
        <div class="card-title">🗄️ Database</div>
        <div class="card-status">
          <div class="metric">
            <div class="metric-label">Status</div>
            <div class="metric-value" style="color: ${getStatusColor(data.database?.ok)}">
              ${getStatusText(data.database?.ok)}
            </div>
          </div>
          <span class="status-indicator" style="background: ${getStatusColor(data.database?.ok)};"></span>
        </div>
        <div class="divider"></div>
        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Connected</div>
            <div class="meta-value">${data.database?.connected ? "Yes" : "No"}</div>
          </div>
          ${databaseReason ? `<div class="meta-item"><div class="meta-label">Reason</div><div class="meta-value">${databaseReason}</div></div>` : ""}
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Last checked: ${timestamp}</p>
      <p style="margin-top: 8px; color: #4a5268;">GH Control System Monitoring</p>
    </div>
  </div>
</body>
</html>
  `;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  }) as Promise<T>;
}

async function checkRedis() {
  const client = getRedis();
  if (!client) {
    return { ok: false, reachable: false, reason: "disabled" };
  }

  try {
    await withTimeout(client.ping(), HEALTH_TIMEOUT_MS);
    return { ok: true, reachable: true };
  } catch (error) {
    return {
      ok: false,
      reachable: false,
      reason: error instanceof Error ? error.message : "unreachable",
    };
  }
}

async function checkDatabase() {
  if (mongoose.connection.readyState === 1) {
    return { ok: true, connected: true };
  }

  try {
    await withTimeout(connectDB(), HEALTH_TIMEOUT_MS);
    const connected = Number(mongoose.connection.readyState) === 1;
    return {
      ok: connected,
      connected,
    };
  } catch (error) {
    return {
      ok: false,
      connected: false,
      reason: error instanceof Error ? error.message : "unreachable",
    };
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "html";

  try {
    const [serverStatus, redisStatus, databaseStatus] =
      await Promise.allSettled([
        Promise.resolve({
          ok: true,
          uptimeMs: process.uptime() * 1000,
          timestamp: new Date().toISOString(),
        }),
        withTimeout(checkRedis(), HEALTH_TIMEOUT_MS),
        withTimeout(checkDatabase(), HEALTH_TIMEOUT_MS),
      ]);

    const result = {
      ok:
        serverStatus.status === "fulfilled" &&
        serverStatus.value.ok &&
        redisStatus.status === "fulfilled" &&
        redisStatus.value.ok &&
        databaseStatus.status === "fulfilled" &&
        databaseStatus.value.ok,
      server:
        serverStatus.status === "fulfilled" ?
          serverStatus.value
        : { ok: false, error: "Failed to get server status" },
      redis:
        redisStatus.status === "fulfilled" ?
          redisStatus.value
        : { ok: false, reachable: false, reason: "timeout" },
      database:
        databaseStatus.status === "fulfilled" ?
          databaseStatus.value
        : { ok: false, connected: false, reason: "timeout" },
    };

    const endTime = Date.now();
    console.log(`[Health] Check completed in ${endTime - startTime}ms`, result);

    if (format === "json") {
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const html = generateHealthHTML(result);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Health] Unexpected error:", error);
    const result = {
      ok: false,
      error: "Internal health check error",
    };

    const format = new URL(request.url).searchParams.get("format") || "html";
    if (format === "json") {
      return NextResponse.json(result, {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const html = generateHealthHTML(result);
    return new NextResponse(html, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
