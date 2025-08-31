"use client"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
async function patchTicket(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to update ticket")
  return res.json()
}

export function TicketsTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { data, mutate, isLoading } = useSWR(
    `/api/tickets${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
    fetcher,
  )
  const tickets = data?.tickets || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => mutate()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p>Loading tickets...</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <TicketRow key={t.id} ticket={t} onChanged={mutate} />
          ))}
          {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets</p>}
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket, onChanged }: { ticket: any; onChanged: () => void }) {
  const [status, setStatus] = useState<string>(ticket.status)
  const [assignee, setAssignee] = useState<string>(ticket.assignedRole ?? "Unassigned")
  const [reply, setReply] = useState("")

  const { trigger, isMutating } = useSWRMutation(`/api/tickets/${ticket.id}`, patchTicket)

  const onSave = async () => {
    await trigger({ status, assignedRole: assignee || null, reply, by: "Supervisor" })
    setReply("")
    onChanged()
  }

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">{ticket.subject}</h3>
          <p className="text-sm text-muted-foreground">
            {ticket.category} • severity {ticket.severity}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assign role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Owner">Owner</SelectItem>
              <SelectItem value="Founder">Founder</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onSave} disabled={isMutating}>
            Save
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <p className="text-sm">{ticket.message}</p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Conversation</p>
          <div className="rounded-md border p-2 space-y-1 max-h-40 overflow-auto">
            {ticket.messages.map((m: any, idx: number) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{m.by}:</span> {m.text}
              </div>
            ))}
          </div>
          <Textarea placeholder="Reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
