"use client"
import { useEffect } from "react"

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) return { vendor: null, renderer: null }
    const dbgInfo = (gl as any).getExtension?.("WEBGL_debug_renderer_info")
    const vendor = dbgInfo ? (gl as any).getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL) : null
    const renderer = dbgInfo ? (gl as any).getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) : null
    return { vendor, renderer }
  } catch {
    return { vendor: null, renderer: null }
  }
}

function randomNonce() {
  try {
    const buf = new Uint8Array(12)
    crypto.getRandomValues(buf)
    return Array.from(buf)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  } catch {
    return String(Date.now())
  }
}

export function IntegrityReporter() {
  useEffect(() => {
    const controller = new AbortController()
    const nav = navigator as any
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    const webgl = getWebGLInfo()

    const payload = {
      ua: navigator.userAgent,
      platform: navigator.platform,
      languages: navigator.languages,
      dnt: (navigator as any).doNotTrack ?? null,
      webdriver: (navigator as any).webdriver ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      hardwareConcurrency: (navigator as any).hardwareConcurrency ?? null,
      deviceMemory: (navigator as any).deviceMemory ?? null,
      vendor: webgl.vendor,
      renderer: webgl.renderer,
      visibility: document.visibilityState,
      effectiveType: conn?.effectiveType ?? null,
      screen: { w: window.screen.width, h: window.screen.height },
    }
    ;(async () => {
      try {
        await fetch("/api/integrity/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
      } catch {
        // swallow
      }

      // Call attestation stub for 'web' with a randomized nonce once per mount
      try {
        await fetch("/api/integrity/attestation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: "web", nonce: randomNonce() }),
          signal: controller.signal,
        })
      } catch {
        // swallow
      }
    })()

    return () => controller.abort()
  }, [])

  return null
}
