"use client"

import type React from "react"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSWRConfig } from "swr"

type CreatePayload = {
  url: string
  title?: string
  tags?: string[]
  durationMinutes?: number
  priority?: number
}

async function createPromotion(url: string, { arg }: { arg: CreatePayload }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e?.error || "Failed to create promotion")
  }
  return res.json()
}

export function PromotionForm({ onCreated }: { onCreated?: () => void }) {
  const [ytUrl, setYtUrl] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [duration, setDuration] = useState<string>("30")
  const [priority, setPriority] = useState<string>("1")

  const { trigger, isMutating } = useSWRMutation("/api/promotions", createPromotion)
  const { mutate } = useSWRConfig()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreatePayload = {
      url: ytUrl,
      title: title || undefined,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      durationMinutes: Number(duration),
      priority: Number(priority),
    }
    try {
      await trigger(payload)
      mutate("/api/promotions")
      setYtUrl("")
      setTitle("")
      setTags("")
      setDuration("30")
      setPriority("1")
      onCreated?.()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-balance">Submit a YouTube Promotion</CardTitle>
        <CardDescription>Non-incentivized directory placement. Paste a YouTube link or ID.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="yt">YouTube URL or ID</Label>
            <Input
              id="yt"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" placeholder="My awesome video" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="gaming, coding, music"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger aria-label="Duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger aria-label="Priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="2">VIP</SelectItem>
                  <SelectItem value="3">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isMutating}>
                {isMutating ? "Submitting..." : "Submit Promotion"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
