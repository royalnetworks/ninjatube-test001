import { DonationForm } from "@/components/donation-form"
import { DonationWall } from "@/components/donation-wall"
import { DonationBroadcast } from "@/components/donation-broadcast"

export default function DonationsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <DonationBroadcast />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Donations</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Support Ninja Tube with a one-time UPI donation. This demo creates an intent link and uses a verification
          stub. In production, donations are confirmed via secure payment gateway webhooks and shown on the donation
          wall.
        </p>
      </header>

      <section className="mb-10">
        <DonationForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Donation Wall</h2>
        <DonationWall />
      </section>
    </main>
  )
}
