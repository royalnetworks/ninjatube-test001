import { AdAdminForm } from "@/components/ad-admin-form"
import { AdSlot } from "@/components/ad-slot"

export default function AdsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Ad Container</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Create and preview ads with placement targeting and frequency caps. This demo uses in-memory data; production
          should use Firestore and Cloud Functions for targeting and rewards.
        </p>
      </header>

      <section className="mb-10">
        <AdAdminForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="mb-2 font-medium">Homepage placement</h3>
            <AdSlot placement="homepage" />
          </div>
          <div>
            <h3 className="mb-2 font-medium">Feed placement</h3>
            <AdSlot placement="feed" />
          </div>
        </div>
      </section>
    </main>
  )
}
