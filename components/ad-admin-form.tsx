"use client"

import type React from "react"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Placement = "homepage" | "feed" | "dojo" | "watch" | "leaderboard" | "profile"

const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

export function AdAdminForm() {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState<"image" | "video" | "html">("image")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [ctaLabel, setCtaLabel] = useState("Visit")
  const [ctaUrl, setCtaUrl] = useState("")
  const [html, setHtml] = useState("<div style='padding:16px'>Hello from an HTML Ad</div>")
  const [placement, setPlacement] = useState<Placement>("homepage")
  const [freq, setFreq] = useState("3")
  const [durationMins, setDurationMins] = useState("60")

  const { trigger, isMutating } = useSWRMutation("/api/ads", poster)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const now = Date.now()
    const body: any = {
      title,
      description: desc,
      type,
      placements: [placement],
      frequencyCapPerDay: Number(freq),
      schedule: { startAt: now, endAt: now + Number(durationMins) * 60 * 1000 },
      ctaLabel,
      ctaUrl,
    }
    if (type === "image") body.imageUrl = imageUrl
    if (type === "video") body.videoUrl = videoUrl
    if (type === "html") body.html = html

    const res = await trigger(body)
    if (res?.error) {
      alert(res.error)
      return
    }
    setTitle("")
    setDesc("")
    setImageUrl("")
    setVideoUrl("")
    setCtaUrl("")
    setHtml("<div style='padding:16px'>Hello from an HTML Ad</div>")
    alert("Ad created")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ad (Demo)</CardTitle>
        <CardDescription>Define a simple ad with placement, schedule, and frequency capping.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Placement</Label>
              <Select value={placement} onValueChange={(v) => setPlacement(v as Placement)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage">Homepage</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="dojo">Clan Dojo</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="leaderboard">Leaderboard</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Freq cap/day</Label>
              <Input type="number" min={1} max={10} value={freq} onChange={(e) => setFreq(e.target.value)} />
            </div>
          </div>

          {type === "image" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Image URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label>CTA URL</Label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          ) : null}

          {type === "video" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Video URL (mp4/webm)</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label>CTA URL</Label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          ) : null}

          {type === "html" ? (
            <div className="flex flex-col gap-2">
              <Label>HTML Snippet</Label>
              <Textarea rows={6} value={html} onChange={(e) => setHtml(e.target.value)} />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>CTA Label</Label>
              <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Visit" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Duration (mins)</Label>
              <Input
                type="number"
                min={5}
                max={240}
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Creating..." : "Create Ad"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
