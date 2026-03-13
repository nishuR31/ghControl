import Redis from 'ioredis'

declare global {
  var _redis: Redis | null
}

export function getRedis(): Redis {
  if (global._redis) return global._redis

  const url = process.env.REDIS_URL || 'redis://localhost:6379'

  // RedisLabs / Upstash use plain redis:// but require TLS on non-6379 ports.
  // Detect by checking if it's NOT localhost — then force TLS.
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1')

  const redis = new Redis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    // Force TLS for remote Redis (RedisLabs, Upstash, etc.)
    tls: isLocal ? undefined : {},
    // Don't crash the build/process on connection error
    enableOfflineQueue: false,
    connectTimeout: 8000,
    commandTimeout: 5000,
    retryStrategy: (times) => {
      if (times > 3) return null // stop retrying after 3 attempts
      return Math.min(times * 500, 2000)
    },
  })

  redis.on('error', (err) => {
    // Silent on ECONNREFUSED during build — only log in runtime
    if (!err.message.includes('ECONNREFUSED')) {
      console.error('[Redis]', err.message)
    }
  })

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
