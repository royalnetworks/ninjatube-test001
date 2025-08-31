// In-memory donations store for demo purposes.
// Replace with Firestore + verified gateway webhooks in production.

export type Donation = {
  id: string
  donorName: string
  amount: number
  currency: "INR"
  method: "upi" | "gateway" | "gems"
  txnId?: string | null
  note?: string | null
  status: "pending" | "received" | "failed"
  createdAt: number
}

const donations: Donation[] = []

export function createDonationRecord(input: Omit<Donation, "id" | "createdAt">) {
  const rec: Donation = {
    id: `don_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ...input,
  }
  donations.push(rec)
  return rec
}

export function listRecentDonations(limit = 25) {
  return donations
    .filter((d) => d.status !== "failed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function markDonationReceived(id: string) {
  const rec = donations.find((d) => d.id === id)
  if (rec) rec.status = "received"
  return rec ?? null
}

export function aggregateTopDonors(limit = 5) {
  const map = new Map<string, number>()
  for (const d of donations) {
    if (d.status !== "received") continue
    const key = d.donorName || "Anonymous"
    map.set(key, (map.get(key) ?? 0) + d.amount)
  }
  const arr = Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
  return arr.slice(0, limit)
}

export function totals() {
  const now = new Date()
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  let monthTotal = 0
  let lifetimeTotal = 0
  for (const d of donations) {
    if (d.status !== "received") continue
    lifetimeTotal += d.amount
    const dKey = `${new Date(d.createdAt).getUTCFullYear()}-${String(new Date(d.createdAt).getUTCMonth() + 1).padStart(
      2,
      "0",
    )}`
    if (dKey === monthKey) monthTotal += d.amount
  }
  return { monthTotal, lifetimeTotal }
}

export function listAllDonations() {
  return donations.slice().sort((a, b) => b.createdAt - a.createdAt)
}

export const DonationsStore = {
  list: listAllDonations,
  recent: listRecentDonations,
  create: createDonationRecord,
  markReceived: markDonationReceived,
  aggregateTop: aggregateTopDonors,
  totals,
}
