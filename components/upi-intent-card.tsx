"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

export function UpiIntentCard() {
  const [amount, setAmount] = useState<string>("50")
  const [note, setNote] = useState<string>("Ninja Tube Top-up")
  const { trigger, isMutating } = useSWRMutation("/api/payments/upi-intent", poster)

  async function createIntent() {
    const res = await trigger({ amount: Number(amount), note })
    if (res?.error) {
      alert(res.error)
      return
    }
    if (res?.link) {
      // Opening UPI link works on mobile with a UPI app installed.
      window.location.href = res.link as string
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Gems via UPI (Demo)</CardTitle>
        <CardDescription>
          Generates a UPI intent link. Real verification will be added with your chosen gateway.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount in INR"
            placeholder="Amount (INR)"
          />
          <Input value={note} onChange={(e) => setNote(e.target.value)} aria-label="Payment note" placeholder="Note" />
          <Button onClick={createIntent} disabled={isMutating}>
            {isMutating ? "Creating..." : "Pay via UPI"}
          </Button>
        </div>
        <p className="text-xs text-slate-600">
          Configure your UPI ID in server env as UPI_ID. This demo does not verify payments; a gateway must be used for
          verification.
        </p>
      </CardContent>
    </Card>
  )
}
