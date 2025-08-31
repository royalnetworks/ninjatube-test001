import { StoreList } from "@/components/store-list"
import { CouponRedeemer } from "@/components/coupon-redeemer"
import { ReceiptsList } from "@/components/receipts-list"
import { UpiIntentCard } from "@/components/upi-intent-card"

export default function StorePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Ninja Tube Store</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Buy boosts, subscriptions, and skins using Coins or Gems. Coupons are verified server-side before granting
          rewards. Payments with UPI/gateways will be integrated in a later step.
        </p>
      </header>

      <section className="mb-10">
        <CouponRedeemer />
      </section>

      <section className="mb-10">
        <UpiIntentCard />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <StoreList />
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Receipts</h2>
        <ReceiptsList />
      </section>
    </main>
  )
}
