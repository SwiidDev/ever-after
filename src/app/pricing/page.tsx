import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pricing — Credit packs for vendors" };

const INCLUDED = [
  "Ever After verified badge",
  "Profile listed in search",
  "AI-generated description help",
  "Up to 5-vendor lead distribution",
  "Pay-only on introductions, no commission",
  "Free money-path honesty (no hidden fees)",
];

export default async function PricingPage() {
  const bundles = await prisma.creditBundle.findMany({ where: { active: true } });

  return (
    <div>
      <section className="bg-[var(--background)] px-6 py-24 text-center">
        <p className="eyebrow">For Vendors</p>
        <h1 className="mt-3 font-serif text-4xl font-medium sm:text-6xl">
          Pay only for the introductions that matter.
        </h1>
        <div className="hairline mx-auto mt-8 w-32" />
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-400">
          Buy credits, unlock lead details, contact qualified couples. No
          subscription lock, no commission on bookings.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {bundles.map((b, idx) => {
            const popular = idx === 1;
            return (
              <div
                key={b.id}
                className={`relative rounded-2xl border p-7 ${
                  popular
                    ? "border-[var(--gold)] bg-[var(--bone)] shadow-[0_0_40px_rgba(197,160,89,0.15)]"
                    : "surface"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-black">
                    Most popular
                  </span>
                )}
                <p className="eyebrow">{b.name}</p>
                <p className="mt-3 font-serif text-5xl text-white">
                  R{(b.priceCents / 100).toFixed(0)}
                  <span className="ml-1 text-sm font-sans text-neutral-500">
                    / pack
                  </span>
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  {b.credits} credits ·{" "}
                  R{(b.priceCents / b.credits / 100).toFixed(2)} / credit
                </p>
                <div className="hairline my-5" />
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>· {Math.round(b.credits / 4)} venue leads</li>
                  <li>· or {Math.round(b.credits / 10)} photography leads</li>
                  <li>· credits valid for 12 months</li>
                </ul>
                <Link
                  href="/vendor/register"
                  className={`mt-7 block rounded-full px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
                    popular
                      ? "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                      : "border border-[var(--gold)]/60 text-[var(--gold)] hover:bg-[var(--gold)]/10"
                  }`}
                >
                  {popular ? "Get started" : "Choose pack"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl surface p-7">
          <p className="eyebrow">Every pack includes</p>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-neutral-300"
              >
                <span className="text-[var(--gold)]">✓</span>
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="surface rounded-2xl p-7">
            <p className="eyebrow">Lead pricing per category</p>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {[
                  ["Venues", 40, "R 1 200"],
                  ["Catering & Bar", 30, "R 900"],
                  ["Photography & Video", 20, "R 600"],
                  ["Flowers & Decor", 15, "R 450"],
                  ["Dresses & Suits", 15, "R 450"],
                  ["Hair & Makeup", 10, "R 300"],
                ].map(([cat, credits, price]) => (
                  <tr key={cat} className="border-b border-white/5">
                    <td className="py-2 text-neutral-300">{cat}</td>
                    <td className="py-2 text-center text-neutral-500">
                      {credits} credits
                    </td>
                    <td className="py-2 text-right font-medium text-[var(--gold)]">
                      {price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--bone)] p-7">
            <p className="eyebrow">The math</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              Couples don't just request one vendor — they usually need 6–9
              (venue, catering, photo, flowers, dress, hair, honeymoon). A
              single acquired couple is worth the cost of every credit in
              your smallest pack.
            </p>
            <Link
              href="/vendor/register"
              className="mt-5 inline-block rounded-full border border-[var(--gold)]/60 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              List your business →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
