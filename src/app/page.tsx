import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

const HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=2400&q=80&auto=format&fit=crop";

const CATEGORY_PHOTOS: Record<string, string> = {
  Venues: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80&auto=format&fit=crop",
  "Catering & Bar":
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=900&q=80&auto=format&fit=crop",
  "Photography & Video":
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop",
  "Flowers & Decor":
    "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=900&q=80&auto=format&fit=crop",
  "Dresses & Suits":
    "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=900&q=80&auto=format&fit=crop",
  "Hair & Makeup":
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80&auto=format&fit=crop",
  Honeymoon:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80&auto=format&fit=crop",
};

const TESTIMONIALS = [
  {
    name: "Jayne",
    city: "Pretoria",
    body: "I had 4 replies within 30 minutes and my venue was booked that week. Genuinely brilliant.",
  },
  {
    name: "Nathalie",
    city: "Johannesburg",
    body: "Posted a quote request on a Sunday, had 5 contacts by Monday morning. So much easier than chasing vendors one by one.",
  },
  {
    name: "Morne",
    city: "Stellenbosch",
    body: "Got real vendor options, not just random Google results — and the budget tracker kept us honest.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO with real wedding photo */}
      <section
        className="relative isolate overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-white" />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 text-center text-white">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
            Made for South African couples
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold drop-shadow sm:text-6xl">
            Find the best <span className="text-pink-300">wedding</span>{" "}
            professionals in South Africa
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Venues, caterers, photographers and more — free quotes from
            vetted wedding pros, in minutes.
          </p>
          <form
            action="/search"
            className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full bg-white p-1 shadow-lg"
          >
            <input
              name="q"
              placeholder="What are you looking for..."
              className="w-full px-5 py-3 text-sm text-neutral-900 outline-none"
            />
            <input
              name="loc"
              defaultValue="Pretoria"
              className="w-40 border-l border-neutral-200 px-3 text-sm text-neutral-900 outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white hover:bg-pink-700"
            >
              Search
            </button>
          </form>
          <p className="mt-3 text-xs text-white/80">
            Free for couples · No commission · Up to 5 quotes per request
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-6 text-center text-sm text-neutral-700 sm:grid-cols-4">
          <Stat value="9" label="Wedding categories" />
          <Stat value="14" label="Vetted SA vendors" />
          <Stat value="Free" label="Always for couples" />
          <Stat value="4.5★" label="Average rating" />
        </div>
      </section>

      {/* CATEGORIES WITH PHOTOS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-3 font-serif text-3xl font-semibold">
          One marketplace, every wedding service
        </h2>
        <p className="mb-8 max-w-2xl text-neutral-600">
          Browse by what you need most — we share your brief with up to 5
          matched pros.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat shadow-sm transition hover:shadow-lg"
              style={{ backgroundImage: `url("${CATEGORY_PHOTOS[cat] ?? HERO}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent transition group-hover:via-black/30" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-serif text-xl font-semibold text-white">
                  {cat}
                </p>
                <p className="mt-0.5 text-xs text-white/80">
                  Browse {cat.toLowerCase()} →
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/search"
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 hover:border-pink-400 hover:text-pink-600"
          >
            See all categories →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-pink-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center font-serif text-3xl font-semibold">
            How {BRAND.name} works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <Step
              n="1"
              title="Tell us what you need"
              body="Pick a category, share a few details, and we'll match you with up to 5 local pros."
            />
            <Step
              n="2"
              title="Compare quotes"
              body="Pros reach out with quotes and ideas. No spam, no obligation — you stay in control."
            />
            <Step
              n="3"
              title="Book & plan"
              body="Use our free wedding tools — guest list, budget, checklist — to stay on top of everything."
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-serif text-3xl font-semibold">
          Couples love {BRAND.name}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <blockquote className="text-sm leading-relaxed text-neutral-700">
                “{t.body}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FOR VENDORS CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="overflow-hidden rounded-2xl bg-neutral-900 text-white">
          <div className="grid items-center gap-6 p-8 sm:grid-cols-2 sm:p-12">
            <div>
              <p className="text-xs uppercase tracking-wider text-pink-300">
                For wedding vendors
              </p>
              <h3 className="mt-2 font-serif text-3xl font-semibold">
                Get hot leads from couples ready to book
              </h3>
              <p className="mt-3 text-white/80">
                Pay only for the introductions that matter. Lead-grade
                quality controls and fair rotation keep your inbox full of
                qualified couples.
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/vendor/register"
                  className="rounded-full bg-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-700"
                >
                  Get a free listing
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:border-white"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric n="R3000" label="Avg basket per couple" />
                <Metric n="5–9" label="Leads per couple" />
                <Metric n="75%" label="Gross margin" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl font-bold text-pink-700">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-serif text-lg font-bold text-white">
        {n}
      </span>
      <h3 className="mt-3 font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{body}</p>
    </div>
  );
}

function Metric({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 backdrop-blur">
      <p className="font-serif text-xl font-bold text-pink-300">{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}
