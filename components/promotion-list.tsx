"use client"

import useSWR from "swr"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toThumbnailUrl, type Promotion } from "@/lib/promotions-store"

type ApiResp = { items: Promotion[] }

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<ApiResp>)

export function PromotionList() {
  const { data, isLoading, mutate } = useSWR<ApiResp>("/api/promotions", fetcher, { refreshInterval: 10_000 })

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading promotions...</div>
  }

  const items = data?.items ?? []

  if (items.length === 0) {
    return <div className="text-sm text-slate-600">No active promotions yet. Be the first to submit one.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((p) => {
        const href =
          p.platform === "youtube"
            ? `https://www.youtube.com/watch?v=${p.videoId}`
            : p.videoId.startsWith("http")
              ? p.videoId
              : `https://${p.platform}.com${p.videoId.startsWith("/") ? "" : "/"}${p.videoId}`

        return (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative w-full h-44">
              <Image
                src={
                  p.platform === "youtube"
                    ? toThumbnailUrl(p.videoId)
                    : "/placeholder.svg?height=176&width=320&query=promotion%20thumbnail"
                }
                alt={p.title || "Promotion thumbnail"}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <CardHeader className="py-3">
              <CardTitle className="text-pretty text-base">{p.title || "Untitled Video"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {p.priority === 3 ? "Premium" : p.priority === 2 ? "VIP" : "Normal"}
                  </Badge>
                  <span>Ends in {timeLeft(p.endAt)}</span>
                </div>
                <span className="text-slate-500">{p.platform.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(p.tags ?? []).slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-end">
                <Button asChild variant="default" size="sm">
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    View on {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function timeLeft(endAt: number): string {
  const ms = Math.max(0, endAt - Date.now())
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  if (min > 0) return `${min}m ${sec}s`
  return `${sec}s`
}
