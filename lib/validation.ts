// Simple utilities for validating and parsing YouTube URLs

export function extractYouTubeVideoId(input: string): string | null {
  try {
    const url = new URL(input.trim())
    // Handle youtu.be/<id>
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "")
      return id || null
    }
    // Handle www.youtube.com/watch?v=<id> and youtube.com/watch?v=<id>
    if (url.hostname.endsWith("youtube.com") && (url.pathname === "/watch" || url.pathname === "/live")) {
      const v = url.searchParams.get("v")
      return v ? v : null
    }
    // Handle /shorts/<id>
    if (url.hostname.endsWith("youtube.com") && url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2]
      return id || null
    }
    // Fallback: if it looks like a plain ID (11 chars), accept cautiously
    if (!input.includes("http") && /^[a-zA-Z0-9_-]{6,20}$/.test(input.trim())) {
      return input.trim()
    }
    return null
  } catch {
    // If it's not a URL, maybe it's a raw ID
    if (/^[a-zA-Z0-9_-]{6,20}$/.test(input.trim())) {
      return input.trim()
    }
    return null
  }
}

export function isNonEmpty(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0
}
