export type TicketSeverity = "low" | "medium" | "high"
export type TicketStatus = "open" | "in_progress" | "closed"
export type TicketRole = "Supervisor" | "Manager" | "Owner" | "Founder" | null

export interface TicketMessage {
  by: string // "user" | role
  text: string
  at: number
}

export interface Ticket {
  id: string
  uid?: string
  subject: string
  message: string
  category: string
  severity: TicketSeverity
  status: TicketStatus
  assignedRole: TicketRole
  createdAt: number
  updatedAt: number
  messages: TicketMessage[]
}

const tickets: Ticket[] = []

const genId = () => Math.random().toString(36).slice(2, 10)

export const TicketsStore = {
  list: (status?: TicketStatus) => {
    // newest first
    const data = tickets.slice().sort((a, b) => b.createdAt - a.createdAt)
    return status ? data.filter((t) => t.status === status) : data
  },
  get: (id: string) => tickets.find((t) => t.id === id) || null,
  create: (input: {
    uid?: string
    subject: string
    message: string
    category: string
    severity: TicketSeverity
  }) => {
    const now = Date.now()
    const t: Ticket = {
      id: genId(),
      uid: input.uid,
      subject: input.subject,
      message: input.message,
      category: input.category,
      severity: input.severity,
      status: "open",
      assignedRole: null,
      createdAt: now,
      updatedAt: now,
      messages: [{ by: input.uid ? "user" : "guest", text: input.message, at: now }],
    }
    tickets.unshift(t)
    return t
  },
  update: (id: string, patch: Partial<Pick<Ticket, "status" | "assignedRole">> & { reply?: string; by?: string }) => {
    const t = tickets.find((x) => x.id === id)
    if (!t) return null
    if (patch.status) t.status = patch.status
    if (typeof patch.assignedRole !== "undefined") t.assignedRole = patch.assignedRole
    if (patch.reply) t.messages.push({ by: patch.by || "Supervisor", text: patch.reply, at: Date.now() })
    t.updatedAt = Date.now()
    return t
  },
}
