"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Purchase = {
  id: string
  itemId: string
  currency: "coins" | "gems"
  amount: number
  createdAt: number
  status: "success" | "failed"
  entitlement: { kind: "grant" | "unlock" | "subscription"; ref: string; expiresAt?: number } | null
}
type Resp = { purchases: Purchase[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<Resp>)

export function ReceiptsList() {
  const { data, isLoading } = useSWR<Resp>("/api/store/purchases", fetcher, { refreshInterval: 15000 })

  if (isLoading) return <div className="text-sm text-slate-500">Loading receipts...</div>

  const list = data?.purchases ?? []
  if (list.length === 0) return <div className="text-sm text-slate-600">No purchases yet.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.map((p) => (
        <Card key={p.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receipt</CardTitle>
            <CardDescription className="text-xs">{new Date(p.createdAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Item</span>
              <span className="font-medium">{p.itemId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Amount</span>
              <span className="font-medium">
                {p.amount} {p.currency === "coins" ? "Coins" : "Gems"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={p.status === "success" ? "text-emerald-600" : "text-red-600"}>{p.status}</span>
            </div>
            {p.entitlement ? (
              <div className="text-xs text-slate-600">
                Entitlement: {p.entitlement.kind} ({p.entitlement.ref})
                {p.entitlement.expiresAt ? ` • Expires ${new Date(p.entitlement.expiresAt).toLocaleDateString()}` : ""}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
