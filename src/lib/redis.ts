import Redis from "ioredis";

type RedisTls = { rejectUnauthorized?: boolean };

const REDIS_OP_TIMEOUT_MS = 300;

let redisDisabled = false;

function isRedisNetworkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code =
    "code" in err ? String((err as { code?: unknown }).code || "") : "";
  return (
    code === "ENOTFOUND" || code === "EAI_AGAIN" || code === "ECONNREFUSED"
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Redis operation timed out"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function envFlag(name: string): boolean | null {
  const value = process.env[name];
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes")
    return true;
  if (normalized === "0" || normalized === "false" || normalized === "no")
    return false;
  return null;
}

function resolveTlsConfig(redisUrl: string): RedisTls | undefined {
  let protocol = "redis:";
  try {
    protocol = new URL(redisUrl).protocol;
  } catch {
    protocol = redisUrl.startsWith("rediss://") ? "rediss:" : "redis:";
  }

  const tlsEnabledByUrl = protocol === "rediss:";
  const tlsEnabledByEnv = envFlag("REDIS_TLS");
  const shouldUseTls = tlsEnabledByEnv ?? tlsEnabledByUrl;
  if (!shouldUseTls) return undefined;

  const rejectUnauthorized = envFlag("REDIS_TLS_REJECT_UNAUTHORIZED");
  if (rejectUnauthorized === false) return { rejectUnauthorized: false };
  return {};
}

export function getRedisConnectionOptions() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  return {
    url,
    tls: resolveTlsConfig(url),
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 8000,
    commandTimeout: 5000,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 500, 2000);
    },
  };
}

declare global {
  var _redis: Redis | null;
}

function disableRedis(err?: unknown) {
  if (redisDisabled) return;
  redisDisabled = true;

  if (global._redis) {
    try {
      global._redis.removeAllListeners();
      global._redis.disconnect(true);
    } catch {
      /* silent */
    }
  }

  global._redis = null;

  if (err && !isRedisNetworkError(err)) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Redis]", message);
  }
}

export function getRedis(): Redis | null {
  if (redisDisabled) return null;
  if (global._redis) return global._redis;

  const { url, ...options } = getRedisConnectionOptions();
  const redis = new Redis(url, options);

  redis.on("error", (err) => {
    if (isRedisNetworkError(err)) {
      disableRedis(err);
      return;
    }
    console.error("[Redis]", err.message);
  });

  global._redis = redis;
  return redis;
}

async function runRedisOp<T>(op: () => Promise<T>, fallback: T): Promise<T> {
  const redis = getRedis();
  if (!redis) return fallback;

  try {
    return await withTimeout(op(), REDIS_OP_TIMEOUT_MS);
  } catch (err) {
    if (isRedisNetworkError(err)) disableRedis(err);
    return fallback;
  }
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  return runRedisOp(async () => {
    const redis = getRedis();
    if (!redis) return null;
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  }, null);
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60,
): Promise<void> {
  await runRedisOp(async () => {
    const redis = getRedis();
    if (!redis) return null;
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return null;
  }, null);
}

export async function cacheDel(key: string): Promise<void> {
  await runRedisOp(async () => {
    const redis = getRedis();
    if (!redis) return null;
    await redis.del(key);
    return null;
  }, null);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  await runRedisOp(async () => {
    const redis = getRedis();
    if (!redis) return null;
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
    return null;
  }, null);
}
