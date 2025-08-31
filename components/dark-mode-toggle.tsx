"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)" }}
        aria-hidden="true"
      />
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  )
}
