import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/rate-limit"
import { TicketsStore } from "@/lib/tickets-store"
import { IntegrityStore } from "@/lib/integrity-store"
import { PresenceStore } from "@/lib/presence-store"

// Some demo stores may be optional; guard imports with try/catch pattern if needed.
import { DonationsStore } from "@/lib/donations-store"
import { AdsStore } from "@/lib/ads-store"
import { PromotionsStore } from "@/lib/promotions-store"

export async function GET(req: Request) {
  const rl = await enforceRateLimit(req, { key: "analytics:summary", limit: 60, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  const tickets = TicketsStore.list()
  const donations = DonationsStore?.list ? DonationsStore.list() : []
  const promotions = PromotionsStore?.list ? PromotionsStore.list() : []
  const ads = AdsStore?.list ? AdsStore.list() : []
  const integrity = IntegrityStore.list()

  // Only count received donations and sum by `amount` (not amountINR)
  const receivedDonations = donations.filter((d: any) => d.status === "received")
  const donationTotal = receivedDonations.reduce((s: number, d: any) => s + (d.amount || 0), 0)

  const clicks = ads.reduce((s: number, a: any) => s + (a.metrics?.clicks || 0), 0)
  const impressions = ads.reduce((s: number, a: any) => s + (a.metrics?.impressions || 0), 0)

  return NextResponse.json({
    tickets: tickets.length,
    promotions: promotions.length,
    donations: receivedDonations.length,
    donationTotal,
    ads: ads.length,
    adImpressions: impressions,
    adClicks: clicks,
    integrityReports: integrity.length,
    onlineCount: PresenceStore.count(),
  })
}
