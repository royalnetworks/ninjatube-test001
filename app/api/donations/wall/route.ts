// Returns donation wall data: recent donations, top donors, and totals (demo).
import { NextResponse } from "next/server"
import { aggregateTopDonors, listRecentDonations, totals } from "@/lib/donations-store"

export async function GET() {
  const recent = listRecentDonations(25)
  const top = aggregateTopDonors(5)
  const t = totals()
  return NextResponse.json({ recent, top, totals: t })
}
