import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

const HERO =
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=2400&q=80&auto=format&fit=crop";

const STORY_PORTRAIT =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80&auto=format&fit=crop";

const CATEGORY_PHOTO: Record<string, string> = {
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
  "Dance Lessons":
    "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=900&q=80&auto=format&fit=crop",
  "Health & Beauty":
    "https://images.unsplash.com/photo-1530021232320-687d8e3dba54?w=900&q=80&auto=format&fit=crop",
  Honeymoon:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80&auto=format&fit=crop",
};

const TESTIMONIALS = [
  {
    name: "Jayne & Dean",
    location: "Pretoria",
    body: "I had four replies within 30 minutes and my venue was booked that week. Ever After made the start of planning feel easy.",
  },
  {
    name: "Nathalie & Pieter",
    location: "Johannesburg",
    body: "Posted a quote request on a Sunday, had five contacts by Monday morning. So much easier than chasing vendors one by one.",
  },
  {
    name: "Morne & Sean",
    location: "Stellenbosch",
    body: "Real vendor options, not just random Google results — and the budget tracker kept us honest.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO — full-bleed B&W photo with overlay */}
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img
          src={HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.05) brightness(0.78)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <p className="eyebrow">Wedding planning & procurement</p>
          <h1 className="mt-5 font-serif text-6xl font-medium leading-[1.05] text-white drop-shadow sm:text-8xl">
            Timeless Stories.
          </h1>
          <p className="mt-2 font-serif text-5xl italic text-[var(--gold)] sm:text-7xl">
            True Emotions.
          </p>
          <div className="hairline mx-auto mt-10 w-32" />
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80">
            A South African marketplace for couples — and the small studios,
            caterers and photographers who make the day unforgettable.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="rounded-full bg-[var(--gold)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-[var(--gold-soft)]"
            >
              View portfolio →
            </Link>
            <Link
              href="/vendor/register"
              className="rounded-full border border-[var(--gold)]/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              Join as vendor
            </Link>
          </div>
        </div>
      </section>

      {/* OUR STORY — split image + text + stats */}
      <section className="bg-[var(--background)] py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl">
              <img
                src={STORY_PORTRAIT}
                alt="A South African wedding venue at golden hour"
                className="h-full w-full object-cover"
                style={{ filter: "grayscale(0.4) contrast(1.05)" }}
              />
            </div>
            <div className="absolute -bottom-6 left-4 surface rounded-md px-5 py-3 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]">Built in</p>
              <p className="font-serif text-lg text-white">South Africa · 2026</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">The Studio</p>
            <h2 className="mt-3 font-serif text-4xl font-medium leading-tight text-white sm:text-5xl">
              Artisans of light, motion and timeless love.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-300">
              Ever After is the front door couples walk through to find the
              people who quietly make the day feel like the only one that
              mattered. We curate South Africa's finest wedding
              professionals — venues, photographers, ateliers, caterers,
              florists — and bring them to you in a single, calm interface.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Free for couples, forever. We make our living from the vendors
              who pay to receive your brief — never from your pocket.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
              <Stat value="9+" label="Categories" />
              <Stat value="14+" label="Vetted vendors" />
              <Stat value="4.5★" label="Avg rating" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The Collection</p>
            <h2 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">
              One studio, every wedding service.
            </h2>
            <p className="mt-4 text-sm text-neutral-400">
              Curated categories covering the moments worth remembering.
              Tap a tile to see the matched pros in your area.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${encodeURIComponent(cat)}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <img
                  src={CATEGORY_PHOTO[cat] ?? STORY_PORTRAIT}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  style={{ filter: "grayscale(0.6) brightness(0.65)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-serif text-2xl font-medium text-white">
                    {cat}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
                    Browse →
                  </p>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5 transition group-hover:ring-[var(--gold)]/40" />
              </Link>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/search"
              className="rounded-full border border-[var(--gold)]/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              See all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[var(--background)] py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="eyebrow">The Process</p>
            <h2 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">
              How {BRAND.name} works.
            </h2>
          </div>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {[
              { n: "01", title: "Tell us", body: "Pick a category, share a few details about the day you want." },
              { n: "02", title: "Compare", body: "Up to 5 shortlisted pros contact you with quotes and ideas." },
              { n: "03", title: "Book & plan", body: "Use our free planning tools — guest list, budget, checklist." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <p className="font-serif text-5xl text-[var(--gold)]">{s.n}</p>
                <p className="mt-3 font-serif text-2xl text-white">{s.title}</p>
                <div className="hairline mx-auto my-4 w-12" />
                <p className="text-sm text-neutral-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="eyebrow">Love stories</p>
            <h2 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">
              What our couples say.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="surface rounded-2xl p-7 transition hover:border-[var(--gold)]/40"
              >
                <div className="flex gap-1 text-[var(--gold)]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <blockquote className="mt-4 font-serif text-lg italic leading-relaxed text-neutral-200">
                  “{t.body}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold)]/50 font-serif text-sm text-[var(--gold)]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-serif text-sm text-white">{t.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold-soft)]">
                      {t.location}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="bg-[var(--background)] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="surface rounded-3xl px-8 py-14">
            <p className="eyebrow">Are you a vendor?</p>
            <h2 className="mt-3 font-serif text-4xl font-medium text-white sm:text-5xl">
              Get hot leads from couples ready to book.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-400">
              Free listing, lead-grade quality control, fair rotation. Pay
              only for the introductions that matter.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/vendor/register"
                className="rounded-full bg-[var(--gold)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-[var(--gold-soft)]"
              >
                Get a free listing
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-[var(--gold)]/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                See pricing →
              </Link>
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
      <p className="font-serif text-3xl text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]">
        {label}
      </p>
    </div>
  );
}
