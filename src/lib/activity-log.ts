import { gzipSync, gunzipSync } from "zlib";
import { getRedis } from "./redis";
import { connectDB } from "./mongodb";
import { ActionLog } from "./models";

const REDIS_ACTIVITY_KEY = process.env.REDIS_ACTIVITY_KEY || "gh:activity:app";
const REDIS_ACTIVITY_LIMIT = Number(process.env.REDIS_ACTIVITY_LIMIT || 200);
const MONGO_ACTIVITY_ENABLED =
  (process.env.MONGO_ACTIVITY_ENABLED || "true").toLowerCase() !== "false";

type ActivityInput = {
  type: string;
  action: string;
  status?: "queued" | "success" | "failed";
  repo?: string;
  actor?: string;
  payload?: unknown;
  source?: "app" | "external";
};

function compressPayload(payload: unknown) {
  const raw = Buffer.from(JSON.stringify(payload ?? {}), "utf8");
  const gz = gzipSync(raw);
  return {
    rawBytes: raw.byteLength,
    compressedBytes: gz.byteLength,
    payloadGz: gz.toString("base64"),
  };
}

function decompressPayload(base64: string) {
  try {
    const json = gunzipSync(Buffer.from(base64, "base64")).toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function logActivity(input: ActivityInput) {
  const now = new Date().toISOString();
  const status = input.status || "success";
  const source = input.source || "app";
  const compressed = compressPayload(input.payload);

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    action: input.action,
    status,
    repo: input.repo,
    actor: input.actor || "local-user",
    source,
    createdAt: now,
    payload: input.payload ?? null,
  };

  try {
    const redis = getRedis();
    await redis.lpush(REDIS_ACTIVITY_KEY, JSON.stringify(entry));
    await redis.ltrim(
      REDIS_ACTIVITY_KEY,
      0,
      Math.max(0, REDIS_ACTIVITY_LIMIT - 1),
    );
    await redis.expire(REDIS_ACTIVITY_KEY, 60 * 60 * 24 * 14);
  } catch {
    // redis logging should never break app flow
  }

  if (!MONGO_ACTIVITY_ENABLED || source !== "app") return;

  try {
    await connectDB();
    await ActionLog.create({
      type: entry.type,
      action: entry.action,
      status: entry.status,
      repo: entry.repo,
      actor: entry.actor,
      source: entry.source,
      payloadGz: compressed.payloadGz,
      rawBytes: compressed.rawBytes,
      compressedBytes: compressed.compressedBytes,
      createdAt: new Date(now),
    });
  } catch {
    // mongo logging is best-effort
  }
}

export async function getRecentActivity(filter?: { type?: string }) {
  const type = filter?.type?.trim();
  try {
    const redis = getRedis();
    const rows = await redis.lrange(
      REDIS_ACTIVITY_KEY,
      0,
      REDIS_ACTIVITY_LIMIT - 1,
    );
    const parsed = rows
      .map((row) => {
        try {
          return JSON.parse(row);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as any[];

    return type ? parsed.filter((entry) => entry.type?.includes(type)) : parsed;
  } catch {
    // fallback to mongo if redis unavailable
  }

  if (!MONGO_ACTIVITY_ENABLED) return [];

  try {
    await connectDB();
    const q: Record<string, unknown> = { source: "app" };
    if (type) q.type = { $regex: type, $options: "i" };

    const docs = await ActionLog.find(q)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return docs.map((doc: any) => ({
      id: String(doc._id),
      type: doc.type,
      action: doc.action,
      status: doc.status,
      repo: doc.repo,
      actor: doc.actor,
      source: doc.source,
      createdAt: doc.createdAt,
      payload: doc.payloadGz ? decompressPayload(doc.payloadGz) : null,
    }));
  } catch {
    return [];
  }
}
