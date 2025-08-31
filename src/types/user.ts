export type UserRole =
  | "viewer"
  | "creator"
  | "vip"
  | "partner"
  | "admin"
  | "supervisor"
  | "manager"
  | "owner"
  | "founder"

export type UserProfile = {
  uid: string
  name: string
  email: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string
  roles: UserRole[]
  badges: string[]
  publicStats: {
    videosWatched: number
    coinsEarned: number
    referrals: number
    level: number
  }
  vipUntil?: number
  clan: string | null
  createdAt: unknown
  updatedAt: unknown
}

export type Wallet = {
  coins: number
  blackGems: number
  clanTokens: number
  updatedAt: unknown
}
