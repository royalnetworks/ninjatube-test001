"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Donation = {
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

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<{ items: Donation[] }>)
const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

export default function AdminDonationsPage() {
  const { data, isLoading, mutate } = useSWR<{ items: Donation[] }>("/api/donations/all", fetcher, {
    refreshInterval: 8000,
  })
  const confirm = useSWRMutation("/api/donations/confirm", poster)

  async function markReceived(id: string) {
    const res = await confirm.trigger({ donationId: id })
    if (!res?.error) mutate()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Admin • Donations</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Review donation records. In production, this page requires admin authentication and shows verified gateway
          receipts and UTRs.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Donation Logs</CardTitle>
          <CardDescription>Latest records</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading donations...</div>
          ) : (data?.items ?? []).length === 0 ? (
            <div className="text-sm text-slate-600">No donation records yet.</div>
          ) : (
            data!.items.map((d) => (
              <div key={d.id} className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.donorName || "Anonymous"}</span>
                  <span>₹{d.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>{new Date(d.createdAt).toLocaleString()}</span>
                  <span className={d.status === "received" ? "text-emerald-600" : "text-amber-600"}>{d.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Method</span>
                  <span>{d.method.toUpperCase()}</span>
                </div>
                {d.note ? <div className="text-xs text-slate-600">Note: {d.note}</div> : null}
                {d.status !== "received" ? (
                  <div className="pt-2">
                    <Button size="sm" onClick={() => markReceived(d.id)}>
                      Mark Received (demo)
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
