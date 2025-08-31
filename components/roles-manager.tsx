"use client"
import useSWR from "swr"
import type React from "react"

import useSWRMutation from "swr/mutation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
async function setRole(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Update failed")
  return res.json()
}

const roles = ["Viewer", "Creator", "VIP", "Partner", "Admin", "Supervisor", "Manager", "Owner", "Founder"] as const

export function RolesManager() {
  const { data, mutate } = useSWR("/api/admin/roles", fetcher)
  const { trigger, isMutating } = useSWRMutation("/api/admin/roles", setRole)
  const list = data?.roles || []

  const [uid, setUid] = useState("")
  const [role, setRoleValue] = useState<(typeof roles)[number]>("Viewer")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await trigger({ uid, role })
    setUid("")
    mutate()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="User UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          required
          className="md:max-w-sm"
        />
        <Select value={role} onValueChange={(v) => setRoleValue(v as any)}>
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isMutating}>
          Set Role
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Assigned Roles</h3>
        <div className="border rounded-md divide-y">
          {list.length === 0 && <p className="text-sm text-muted-foreground p-3">No roles assigned yet</p>}
          {list.map((r: any) => (
            <div key={r.uid} className="flex items-center justify-between p-3">
              <span className="text-sm">{r.uid}</span>
              <span className="text-sm font-medium">{r.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
