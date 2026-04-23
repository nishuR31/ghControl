import Redis from "ioredis";
import { configDotenv } from "dotenv";
configDotenv({ path: [".env.local", ".env"] });
console.log("🧪 Redis Connection Test\n");

// Test 1: Direct connection test
async function testDirect() {
  console.log("📌 Test 1: Direct Redis Connection");
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  console.log(`   URL: ${redisUrl}`);

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: false,
    connectTimeout: 5000,
    commandTimeout: 3000,
    retryStrategy: (times) => {
      if (times > 2) return null;
      return Math.min(times * 500, 1500);
    },
  });

  return new Promise((resolve) => {
    redis.on("connect", () => {
      console.log("   ✅ Connected to Redis");
      resolve(true);
    });

    redis.on("error", (err) => {
      console.log(`   ❌ Connection Error: ${err.code || err.message}`);
      resolve(false);
    });

    setTimeout(() => {
      console.log("   ⏱️  Connection timeout (5s)");
      resolve(false);
    }, 5000);
  });
}

// Test 2: Ping test
async function testPing() {
  console.log("\n📌 Test 2: PING Command");
  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: false,
    connectTimeout: 5000,
    commandTimeout: 3000,
  });

  try {
    const start = Date.now();
    const result = await Promise.race([
      redis.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000),
      ),
    ]);
    const duration = Date.now() - start;
    console.log(`   ✅ PING successful: "${result}" (${duration}ms)`);
    await redis.quit();
    return true;
  } catch (err) {
    console.log(`   ❌ PING failed: ${err.message || err.code}`);
    await redis.quit();
    return false;
  }
}

// Test 3: Set/Get test
async function testSetGet() {
  console.log("\n📌 Test 3: SET/GET Operations");
  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    lazyConnect: false,
    connectTimeout: 5000,
    commandTimeout: 3000,
  });

  try {
    const testKey = "gh-control:test:key";
    const testValue = {
      message: "Hello Redis",
      timestamp: new Date().toISOString(),
    };

    await redis.setex(testKey, 60, JSON.stringify(testValue));
    console.log(`   ✅ SET "${testKey}" successful`);

    const retrieved = await redis.get(testKey);
    if (retrieved) {
      console.log(`   ✅ GET successful: ${retrieved}`);
      await redis.quit();
      return true;
    } else {
      console.log(`   ❌ GET returned null`);
      await redis.quit();
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Operation failed: ${err.message}`);
    await redis.quit();
    return false;
  }
}

// Run all tests
async function runTests() {
  const test1 = await testDirect();
  const test2 = await testPing();
  const test3 = await testSetGet();

  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results:");
  console.log(`   Connection: ${test1 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   PING:       ${test2 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   SET/GET:    ${test3 ? "✅ PASS" : "❌ FAIL"}`);

  const passed = [test1, test2, test3].filter(Boolean).length;
  console.log(`\n   Overall: ${passed}/3 tests passed`);

  if (passed < 3) {
    console.log("\n⚠️  Redis Issues Detected:");
    if (!test1) console.log("   - Cannot connect to Redis server");
    if (!test2) console.log("   - Redis server not responding to PING");
    if (!test3) console.log("   - Redis SET/GET operations failing");
    console.log("\n💡 Solutions:");
    console.log("   1. Check REDIS_URL in .env");
    console.log("   2. Verify Redis server is running");
    console.log("   3. Check network/firewall connectivity");
    console.log("   4. For RedisLabs, ensure TLS is configured correctly");
  }

  process.exit(passed === 3 ? 0 : 1);
}

runTests().catch(console.error);
