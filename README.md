# Ninja Tube – Auth & Profiles Scaffold (Expo + Firebase)

Security:
- Rotate any exposed keys immediately. Never check in client secrets.
- Wallets and transactions are server-authoritative (rules deny client writes).

What’s included:
- Expo sign-in screen with Google + Guest options.
- Firebase Functions v2:
  - initUserOnCreate: seeds users/{uid} and wallets/{uid}
  - redeemCoupon: server-side coupon redemption with transaction append
  - setUserRole: elevated role assignment via custom claims (owner/founder only)
  - awardCoins: generic earn endpoint with dedupe (policy-safe placeholder)
- Firestore rules to protect wallets/transactions.

Next steps:
- Configure Google OAuth IDs for Expo (Android, iOS, Web) via EXPO_PUBLIC_* envs.
- Deploy functions and rules with Firebase Tools.
- Add real integrity checks (Play Integrity/DeviceCheck) before awarding coins.
- Build Home, Store, Promotions, and Donations flows in subsequent milestones.
