import Redis from 'ioredis'

declare global {
  var _redis: Redis | null
}

export function getRedis(): Redis {
  if (global._redis) return global._redis
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  })
  redis.on('error', (err) => console.error('[Redis]', err.message))
  global._redis = redis
  return redis
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const redis = getRedis()
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch { /* silent */ }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis()
    await redis.del(key)
  } catch { /* silent */ }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch { /* silent */ }
}
