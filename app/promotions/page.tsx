import { PromotionForm } from "@/components/promotion-form"
import { PromotionList } from "@/components/promotion-list"

export default function PromotionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Promotion Directory</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Submit your YouTube video for non-incentivized visibility within Ninja Tube. Promotions are ranked by priority
          and recency and automatically expire after the selected duration.
        </p>
      </header>

      <section className="mb-10">
        <PromotionForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Active Promotions</h2>
        <PromotionList />
      </section>
    </main>
  )
}
