import Redis from "ioredis";

type RedisTls = { rejectUnauthorized?: boolean };

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

export function getRedis(): Redis {
  if (global._redis) return global._redis;

  const { url, ...options } = getRedisConnectionOptions();
  const redis = new Redis(url, options);

  redis.on("error", (err) => {
    // Silent on ECONNREFUSED during build — only log in runtime
    if (!err.message.includes("ECONNREFUSED")) {
      console.error("[Redis]", err.message);
    }
  });

  global._redis = redis;
  return redis;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    /* silent */
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch {
    /* silent */
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    /* silent */
  }
}
