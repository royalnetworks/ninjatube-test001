type Bucket = number[]
type RLMap = Map<string, Bucket>

declare global {
  // eslint-disable-next-line no-var
  var __RL_MAP__: RLMap | undefined
}

const getMap = (): RLMap => {
  if (!globalThis.__RL_MAP__) globalThis.__RL_MAP__ = new Map()
  return globalThis.__RL_MAP__!
}

function getIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || ""
  const ip = fwd.split(",")[0]?.trim()
  return ip || "127.0.0.1"
}

export async function enforceRateLimit(
  req: Request,
  opts: { key: string; limit: number; windowMs?: number },
): Promise<{ ok: true } | { ok: false; headers?: HeadersInit }> {
  const windowMs = opts.windowMs ?? 60_000
  const ip = getIp(req)
  const key = `${opts.key}:${ip}`
  const now = Date.now()
  const map = getMap()
  const bucket = (map.get(key) || []).filter((t) => now - t < windowMs)

  if (bucket.length >= opts.limit) {
    // retry after until the oldest timestamp exits the window
    const retryAfter = Math.ceil((windowMs - (now - bucket[0])) / 1000)
    return { ok: false, headers: { "Retry-After": String(Math.max(retryAfter, 1)) } }
  }

  bucket.push(now)
  map.set(key, bucket)
  return { ok: true }
}

type TakeOptions = { intervalMs: number; max: number }
type TakeResult = { ok: true; remaining: number; reset: number } | { ok: false; remaining: number; reset: number }

/**
 * In-memory sliding-window rate limiter.
 * Uses the same global map as enforceRateLimit to persist during preview.
 */
export const limiter = {
  take(key: string, opts: TakeOptions): TakeResult {
    const windowMs = Math.max(0, opts.intervalMs ?? 60_000)
    const max = Math.max(1, opts.max ?? 1)
    const now = Date.now()
    const map = getMap()
    const bucket = (map.get(key) || []).filter((t) => now - t < windowMs)

    if (bucket.length >= max) {
      const reset = bucket[0] + windowMs
      return { ok: false, remaining: 0, reset }
    }

    bucket.push(now)
    map.set(key, bucket)
    const remaining = Math.max(0, max - bucket.length)
    const reset = bucket[0]! + windowMs
    return { ok: true, remaining, reset }
  },
}
