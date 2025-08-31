"use client"
import { useState } from "react"
import type React from "react"

import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

async function createTicket(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to create ticket")
  return res.json()
}

export function TicketComposer() {
  const { toast } = useToast()
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("general")
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("low")
  const [message, setMessage] = useState("")

  const { trigger, isMutating } = useSWRMutation("/api/tickets", createTicket)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await trigger({ subject, message, category, severity })
      setSubject("")
      setMessage("")
      setCategory("general")
      setSeverity("low")
      toast({ title: "Ticket submitted", description: "We will get back to you shortly." })
    } catch {
      toast({ title: "Submission failed", description: "Please try again later.", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="payout">Payout</SelectItem>
            <SelectItem value="abuse">Abuse Report</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={(v) => setSeverity(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Describe your issue..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        required
      />
      <Button type="submit" disabled={isMutating}>
        Submit Ticket
      </Button>
    </form>
  )
}
