export interface IntegritySignals {
  ua?: string
  platform?: string
  languages?: string[]
  dnt?: string | null
  webdriver?: boolean | null
  timezone?: string | null
  hardwareConcurrency?: number | null
  deviceMemory?: number | null
  vendor?: string | null
  renderer?: string | null
  visibility?: string | null
  effectiveType?: string | null
  screen?: { w: number; h: number } | null
  at?: number
  ip?: string
}

export interface IntegrityReport extends IntegritySignals {
  score: number
}

let reports: IntegrityReport[] = []

export function computeBotScore(s: IntegritySignals): number {
  let score = 0
  if (s.webdriver) score += 60
  if (!s.languages || s.languages.length === 0) score += 10
  if (!s.hardwareConcurrency || s.hardwareConcurrency < 2) score += 10
  if (!s.deviceMemory || s.deviceMemory < 2) score += 10
  if (s.vendor && /swiftshader|google inc\./i.test(s.vendor)) score += 10
  if (s.renderer && /swiftshader|llvmpipe|software/i.test(s.renderer)) score += 10
  if (s.visibility && s.visibility !== "visible") score += 5
  if (s.effectiveType && /2g|slow-2g/.test(s.effectiveType)) score -= 2 // weak signal, small negative
  return Math.max(0, Math.min(100, score))
}

export const IntegrityStore = {
  add: (sig: IntegritySignals) => {
    const entry: IntegrityReport = { ...sig, at: Date.now(), score: computeBotScore(sig) }
    reports.unshift(entry)
    // keep last 500
    reports = reports.slice(0, 500)
    return entry
  },
  list: () => reports.slice(),
}
