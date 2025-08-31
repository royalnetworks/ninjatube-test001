"use client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function NotificationBanner() {
  const { data } = useSWR("/api/notifications", fetcher, { refreshInterval: 20000 })
  const note = data?.notifications?.[0]
  if (!note) return null
  return (
    <div className="w-full bg-secondary text-secondary-foreground px-4 py-2 text-sm text-center">{note.message}</div>
  )
}
