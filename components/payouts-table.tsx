"use client"
import useSWR from "swr"
import type React from "react"

import useSWRMutation from "swr/mutation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
async function patchPayout(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to update payout")
  return res.json()
}
async function createPayout(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to create payout")
  return res.json()
}

export function PayoutsTable() {
  const [status, setStatus] = useState<string>("all")
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/payouts${status !== "all" ? `?status=${status}` : ""}`,
    fetcher,
  )
  const { trigger: update } = useSWRMutation("/api/admin/payouts", patchPayout)
  const { trigger: create } = useSWRMutation("/api/admin/payouts", createPayout)
  const list = data?.payouts || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => mutate()}>
          Refresh
        </Button>
      </div>

      <NewPayoutForm
        onCreate={async (uid, upiId, amountINR) => {
          await create({ uid, upiId, amountINR })
          mutate()
        }}
      />

      {isLoading ? (
        <p>Loading payouts...</p>
      ) : (
        <div className="space-y-3">
          {list.map((p: any) => (
            <div key={p.id} className="border rounded-md p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">UID: {p.uid}</div>
                <div className="text-muted-foreground">UPI: {p.upiId}</div>
                <div>
                  ₹{p.amountINR} • {p.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await update({ id: p.id, status: "approved" })
                    mutate()
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await update({ id: p.id, status: "rejected" })
                    mutate()
                  }}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await update({ id: p.id, status: "paid" })
                    mutate()
                  }}
                >
                  Mark Paid
                </Button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-muted-foreground">No payouts</p>}
        </div>
      )}
    </div>
  )
}

function NewPayoutForm({ onCreate }: { onCreate: (uid: string, upiId: string, amountINR: number) => Promise<void> }) {
  const [uid, setUid] = useState("")
  const [upiId, setUpiId] = useState("")
  const [amount, setAmount] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    await onCreate(uid, upiId, amt)
    setUid("")
    setUpiId("")
    setAmount("")
  }

  return (
    <form onSubmit={submit} className="flex flex-col md:flex-row gap-3">
      <Input
        placeholder="User UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        required
        className="md:max-w-sm"
      />
      <Input
        placeholder="UPI ID (name@bank)"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        required
        className="md:max-w-sm"
      />
      <Input
        placeholder="Amount (INR)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="md:max-w-[140px]"
      />
      <Button type="submit">Create Payout</Button>
    </form>
  )
}
