type UID = string
interface PresenceEntry {
  uid: UID
  lastSeen: number
}

const map = new Map<UID, PresenceEntry>()
const TTL_MS = 60_000

function prune() {
  const now = Date.now()
  for (const [uid, entry] of map.entries()) {
    if (now - entry.lastSeen > TTL_MS) map.delete(uid)
  }
}

export const PresenceStore = {
  heartbeat(uid: UID) {
    const now = Date.now()
    map.set(uid, { uid, lastSeen: now })
    prune()
    return { uid, now }
  },
  list() {
    prune()
    return Array.from(map.values()).sort((a, b) => b.lastSeen - a.lastSeen)
  },
  count() {
    prune()
    return map.size
  },
}
