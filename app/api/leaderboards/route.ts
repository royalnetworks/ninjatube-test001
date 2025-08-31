import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/rate-limit"
import { DonationsStore } from "@/lib/donations-store"

export async function GET(req: Request) {
  const rl = await enforceRateLimit(req, { key: "leaderboards:get", limit: 60, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  const donations = DonationsStore?.list ? DonationsStore.list() : []
  const byDonor = new Map<string, number>()
  for (const d of donations) {
    if (d.status !== "received") continue
    const key = d.donorName || "Anonymous"
    byDonor.set(key, (byDonor.get(key) || 0) + (d.amount || 0))
  }
  const topDonors = Array.from(byDonor.entries())
    .map(([name, total]) => ({ uid: name, totalINR: total })) // keep keys to avoid breaking existing UI
    .sort((a, b) => b.totalINR - a.totalINR)
    .slice(0, 10)

  return NextResponse.json({ topDonors })
}
