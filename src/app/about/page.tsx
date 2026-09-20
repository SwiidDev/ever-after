import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `About — ${BRAND.name}` };

const PILLARS = [
  {
    title: "Couples first",
    body: "100% free, forever. No commission, no upsells on the couple side — just tools and introductions.",
  },
  {
    title: "Honest economics",
    body: "Vendors pay per introduction, not per booking. You see the cost and the upside before you spend.",
  },
  {
    title: "Local-first",
    body: "Built for South Africa — ZAR throughout, SA-aware defaults, categories that match how couples actually plan.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-pink-50 to-white px-4 py-16 text-center">
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">
          Built so wedding planning isn't the hard part
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
          {BRAND.name} is a small South African team building the
          marketplace we wish we'd had when planning our own weddings —
          honest, simple, with the planning tools built-in.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-serif text-2xl font-semibold">
          What we believe
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-700">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-semibold">
            A short story
          </h2>
          <p className="mt-4 text-neutral-700">
            The idea started with a problem every couple knows: good
            vendors are hard to find, and once you find them, you have no
            idea what to pay. We tried every directory, sent a hundred
            WhatsApps, and ended up with a spreadsheet. {BRAND.name}{" "}
            exists so the next couple doesn't have to.
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Got feedback? Email{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-pink-700 underline"
            >
              {BRAND.email}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-semibold">
          Ready to plan?
        </h2>
        <p className="mt-3 text-neutral-600">
          Start your free wedding plan — no sign-up needed to browse.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/search"
            className="rounded-full bg-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-700"
          >
            Find vendors
          </Link>
          <Link
            href="/vendor/register"
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:border-pink-400"
          >
            List your business
          </Link>
        </div>
      </section>
    </div>
  );
}
