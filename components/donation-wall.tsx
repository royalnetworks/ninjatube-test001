"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Donation = {
  id: string
  donorName: string
  amount: number
  currency: "INR"
  status: "pending" | "received" | "failed"
  createdAt: number
}

type WallResp = {
  recent: Donation[]
  top: { name: string; total: number }[]
  totals: { monthTotal: number; lifetimeTotal: number }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<WallResp>)

export function DonationWall() {
  const { data, isLoading } = useSWR<WallResp>("/api/donations/wall", fetcher, { refreshInterval: 8000 })

  if (isLoading) return <div className="text-sm text-slate-500">Loading donation wall...</div>

  const recent = data?.recent ?? []
  const top = data?.top ?? []
  const totals = data?.totals ?? { monthTotal: 0, lifetimeTotal: 0 }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Totals</CardTitle>
          <CardDescription>This month and lifetime totals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Month Total</span>
            <span className="font-semibold">₹{totals.monthTotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Lifetime Total</span>
            <span className="font-semibold">₹{totals.lifetimeTotal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>Daily/weekly/monthly breakdowns can be added later</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top.length === 0 ? (
            <div className="text-sm text-slate-600">No donors yet.</div>
          ) : (
            top.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="font-medium">{d.name}</span>
                <span>₹{d.total.toLocaleString()}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Donors</CardTitle>
          <CardDescription>Live ticker updates every few seconds</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recent.length === 0 ? (
            <div className="text-sm text-slate-600">No donations yet.</div>
          ) : (
            recent.map((d) => (
              <div key={d.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.donorName || "Anonymous"}</span>
                  <span className={d.status === "received" ? "text-emerald-600" : "text-amber-600"}>
                    {d.status === "received" ? "Received" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span>{new Date(d.createdAt).toLocaleString()}</span>
                  <span>₹{d.amount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
