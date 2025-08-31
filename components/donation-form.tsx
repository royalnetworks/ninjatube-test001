"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

export function DonationForm() {
  const [amount, setAmount] = useState<string>("50")
  const [name, setName] = useState<string>("")
  const [note, setNote] = useState<string>("Bless the Temple")
  const [donationId, setDonationId] = useState<string | null>(null)
  const { toast } = useToast()
  const intent = useSWRMutation("/api/donations/intent", poster)
  const confirm = useSWRMutation("/api/donations/confirm", poster)

  async function startDonation() {
    const res = await intent.trigger({ amount: Number(amount), donorName: name || "Anonymous", note })
    if (res?.error) {
      toast({ title: "Failed to start donation", description: res.error })
      return
    }
    setDonationId(res?.donationId ?? null)
    if (res?.link) {
      window.location.href = res.link as string
    }
  }

  async function confirmDonation() {
    if (!donationId) {
      toast({ title: "Missing donation ID", description: "Start a donation first." })
      return
    }
    const res = await confirm.trigger({ donationId })
    if (res?.error) {
      toast({ title: "Confirmation failed", description: res.error })
      return
    }
    toast({ title: "Thank you!", description: "Your donation has been confirmed for the demo." })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Ninja Tube</CardTitle>
        <CardDescription>Donate via UPI. This demo uses a verification stub.</CardDescription>
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
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Your name"
            placeholder="Your name"
          />
          <Input value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" placeholder="Note" />
        </div>
        <div className="flex gap-2">
          <Button onClick={startDonation} disabled={intent.isMutating}>
            {intent.isMutating ? "Starting..." : "Donate via UPI"}
          </Button>
          <Button variant="secondary" onClick={confirmDonation} disabled={confirm.isMutating}>
            {confirm.isMutating ? "Confirming..." : "I Paid (Confirm)"}
          </Button>
        </div>
        <p className="text-xs text-slate-600">
          Configure UPI_ID in server env. In production, confirmation is automatic via gateway webhooks—not this button.
        </p>
      </CardContent>
    </Card>
  )
}
