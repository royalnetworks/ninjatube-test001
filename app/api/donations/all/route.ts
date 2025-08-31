import { NextResponse } from "next/server"
import { listAllDonations } from "@/lib/donations-store"

export async function GET() {
  const items = listAllDonations()
  return NextResponse.json({ items })
}
