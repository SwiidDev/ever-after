import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pricing — Credit packs for vendors" };

const INCLUDED = [
  "Wed Do verified badge",
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
      <section className="bg-gradient-to-b from-pink-50 to-white px-4 py-16 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-pink-600">
          For Vendors
        </p>
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">
          Pay only for the introductions that matter
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">
          Buy credits, unlock lead details, contact qualified couples.
          No subscription lock, no commission on bookings.
        </p>
      </section>

      <section className="mx-auto -mt-4 max-w-5xl px-4 pb-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {bundles.map((b, idx) => {
            const popular = idx === 1;
            return (
              <div
                key={b.id}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
                  popular ? "border-pink-400 ring-2 ring-pink-200" : "border-neutral-200"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink-600 px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <h2 className="font-serif text-xl font-semibold">{b.name}</h2>
                <p className="mt-1 text-3xl font-bold text-pink-700">
                  R{(b.priceCents / 100).toFixed(0)}
                  <span className="text-base font-normal text-neutral-500"> / pack</span>
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {b.credits} credits ·{" "}
                  R{(b.priceCents / b.credits / 100).toFixed(2)} / credit
                </p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li>· {Math.round(b.credits / 4)} venue leads</li>
                  <li>· or {Math.round(b.credits / 10)} photography leads</li>
                  <li>· credits valid for 12 months</li>
                </ul>
                <Link
                  href="/vendor/register"
                  className={`mt-6 block rounded-full px-4 py-2.5 text-center text-sm font-medium ${
                    popular
                      ? "bg-pink-600 text-white hover:bg-pink-700"
                      : "border border-pink-600 text-pink-700 hover:bg-pink-50"
                  }`}
                >
                  {popular ? "Get started" : "Choose pack"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-serif text-xl font-semibold">
            Every pack includes
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-neutral-700"
              >
                <span className="text-pink-600">✓</span>
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="font-serif text-lg font-semibold">
              Lead pricing per category
            </h3>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {[
                  ["Venues", 40, "R 1 200"],
                  ["Catering & Bar", 30, "R 900"],
                  ["Photography & Video", 20, "R 600"],
                  ["Flowers & Decor", 15, "R 450"],
                  ["Dresses & Suits", 15, "R 450"],
                  ["Hair & Makeup", 10, "R 300"],
                ].map(([cat, credits, price]) => (
                  <tr key={cat} className="border-b border-neutral-100">
                    <td className="py-1.5 text-neutral-700">{cat}</td>
                    <td className="py-1.5 text-center text-neutral-500">
                      {credits} credits
                    </td>
                    <td className="py-1.5 text-right font-medium">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl bg-pink-50 p-6">
            <h3 className="font-serif text-lg font-semibold">
              How one couple pays back many times
            </h3>
            <p className="mt-2 text-sm text-neutral-700">
              Couples don't just request one vendor — they usually need 6–9
              (venue, catering, photo, flowers, dress, hair, honeymoon). A
              single acquired couple is worth the cost of every credit in
              your smallest pack.
            </p>
            <Link
              href="/vendor/register"
              className="mt-4 inline-block rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              List your business →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
