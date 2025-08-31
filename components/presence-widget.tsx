"use client"
import { useEffect, useMemo } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function PresenceWidget() {
  const uid = useMemo(() => `guest_${Math.random().toString(36).slice(2, 8)}`, [])
  const { data, mutate } = useSWR("/api/presence", fetcher, { refreshInterval: 15000 })

  useEffect(() => {
    let abort = false
    const beat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        })
        if (!abort) mutate()
      } catch {
        // ignore
      }
    }
    beat()
    const id = setInterval(beat, 25000)
    return () => {
      abort = true
      clearInterval(id)
    }
  }, [uid, mutate])

  const online = data?.count ?? 0
  return <div className="text-xs text-muted-foreground">Online now: {online}</div>
}
