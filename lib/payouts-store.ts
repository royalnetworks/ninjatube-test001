export type PayoutStatus = "pending" | "approved" | "rejected" | "paid"

export interface Payout {
  id: string
  uid: string
  upiId: string
  amountINR: number
  status: PayoutStatus
  createdAt: number
  updatedAt: number
}

const payouts: Payout[] = []

const genId = () => Math.random().toString(36).slice(2, 10)

export const PayoutsStore = {
  list: (status?: PayoutStatus) => {
    const data = payouts.slice().sort((a, b) => b.createdAt - a.createdAt)
    return status ? data.filter((p) => p.status === status) : data
  },
  create: (uid: string, upiId: string, amountINR: number) => {
    const now = Date.now()
    const p: Payout = { id: genId(), uid, upiId, amountINR, status: "pending", createdAt: now, updatedAt: now }
    payouts.unshift(p)
    return p
  },
  update: (id: string, patch: Partial<Pick<Payout, "status">>) => {
    const p = payouts.find((x) => x.id === id)
    if (!p) return null
    if (patch.status) p.status = patch.status
    p.updatedAt = Date.now()
    return p
  },
}
