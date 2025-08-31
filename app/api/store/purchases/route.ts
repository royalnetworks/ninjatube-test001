import { NextResponse } from "next/server"
import { getPurchases } from "@/lib/store-data"

export async function GET() {
  const purchases = getPurchases()
  return NextResponse.json({ purchases })
}
