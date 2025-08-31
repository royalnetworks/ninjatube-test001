export type Provider = "twitch" | "kick" | "rumble"
export interface LinkedAccount {
  uid: string
  provider: Provider
  handle: string
  linkedAt: number
}

let links: LinkedAccount[] = []

export const IntegrationsStore = {
  list(uid?: string) {
    return uid ? links.filter((l) => l.uid === uid) : links.slice()
  },
  link(uid: string, provider: Provider, handle: string) {
    const existing = links.find((l) => l.uid === uid && l.provider === provider)
    const now = Date.now()
    if (existing) {
      existing.handle = handle
      existing.linkedAt = now
      return existing
    }
    const entry = { uid, provider, handle, linkedAt: now }
    links.unshift(entry)
    return entry
  },
  unlink(uid: string, provider: Provider) {
    links = links.filter((l) => !(l.uid === uid && l.provider === provider))
    return true
  },
}
