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
