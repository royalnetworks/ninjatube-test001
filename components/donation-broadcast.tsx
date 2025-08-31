"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

type Donation = {
  id: string
  donorName: string
  amount: number
  status: "pending" | "received" | "failed"
  createdAt: number
}
type WallResp = { recent: Donation[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<WallResp>)

export function DonationBroadcast() {
  const { data } = useSWR<WallResp>("/api/donations/wall", fetcher, { refreshInterval: 5000 })
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState("")
  const lastSeenRef = useRef<string | null>(null)
  const hideTimer = useRef<any>(null)

  useEffect(() => {
    const list = data?.recent ?? []
    if (list.length === 0) return
    const newest = list.find((d) => d.status === "received")
    if (!newest) return
    if (lastSeenRef.current !== newest.id) {
      lastSeenRef.current = newest.id
      setMsg(`${newest.donorName || "Anonymous"} donated ₹${newest.amount.toLocaleString()}. Thank you!`)
      setVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setVisible(false), 6000)
    }
  }, [data])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-md border bg-card px-4 py-2 text-sm shadow-md",
        "animate-in fade-in slide-in-from-top-2",
      )}
    >
      <span className="font-medium">{msg}</span>
    </div>
  )
}
