import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gh-control'

declare global {
  var _mongooseConn: typeof mongoose | null
  var _mongoosePromise: Promise<typeof mongoose> | null
}

let cached = global._mongooseConn
let cachedPromise = global._mongoosePromise

export async function connectDB() {
  if (cached) return cached
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached = await cachedPromise
  global._mongooseConn = cached
  global._mongoosePromise = cachedPromise
  return cached
}
