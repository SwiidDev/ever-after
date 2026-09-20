import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

const HERO_BY_CATEGORY: Record<string, string> = {
  Venues: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800&q=80&auto=format&fit=crop",
  "Catering & Bar":
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1800&q=80&auto=format&fit=crop",
  "Photography & Video":
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80&auto=format&fit=crop",
  "Flowers & Decor":
    "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=1800&q=80&auto=format&fit=crop",
  "Dresses & Suits":
    "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=1800&q=80&auto=format&fit=crop",
  "Hair & Makeup":
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1800&q=80&auto=format&fit=crop",
  "Dance Lessons":
    "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=1800&q=80&auto=format&fit=crop",
  "Health & Beauty":
    "https://images.unsplash.com/photo-1530021232320-687d8e3dba54?w=1800&q=80&auto=format&fit=crop",
  Honeymoon:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&q=80&auto=format&fit=crop",
};

export async function generateMetadata({
  params,
}: PageProps<"/vendor/[slug]">) {
  const { slug } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { slug } });
  return {
    title: vendor ? `${vendor.businessName} — ${BRAND.name}` : "Not found",
  };
}

export default async function VendorPage({
  params,
}: PageProps<"/vendor/[slug]">) {
  const { slug } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });
  if (!vendor || vendor.status !== "APPROVED") notFound();

  // Does the signed-in couple qualify to review (they own a lead this
  // vendor unlocked)?
  const session = await getSession();
  const coupleId = session?.coupleId;
  let canReview = false;
  let qualifyingLeadId: string | null = null;
  if (coupleId) {
    const qualifying = await prisma.lead.findFirst({
      where: {
        coupleId,
        unlocks: { some: { vendorId: vendor.id } },
      },
    });
    if (qualifying) {
      const mine = await prisma.review.findUnique({
        where: { leadId: qualifying.id },
      });
      if (!mine) {
        canReview = true;
        qualifyingLeadId = qualifying.id;
      }
    }
  }

  async function submitReview(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { cookies } = await import("next/headers");
    const { redirect } = await import("next/navigation");
    const session = await getSession();
    const coupleId = session?.coupleId;
    const slug = String(formData.get("slug"));
    const leadId = String(formData.get("leadId"));
    const rating = Number(formData.get("rating"));
    if (!coupleId || !leadId || !(rating >= 1 && rating <= 5)) return;
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, coupleId, unlocks: { some: {} } },
    });
    if (!lead) return;
    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      select: { id: true, ratingAvg: true, ratingCount: true },
    });
    if (!vendor) return;
    const already = await prisma.review.findUnique({
      where: { leadId },
    });
    if (already) return;
    await prisma.review.create({
      data: { vendorId: vendor.id, leadId, rating },
    });
    const newCount = vendor.ratingCount + 1;
    const newAvg =
      (Number(vendor.ratingAvg) * vendor.ratingCount + rating) / newCount;
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { ratingAvg: newAvg, ratingCount: newCount },
    });
    redirect(`/vendor/${slug}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.businessName,
    description: vendor.description ?? undefined,
    address: { addressRegion: vendor.baseRegion, addressCountry: "ZA" },
    ...(vendor.ratingCount > 0
      ? {
          aggregateRating: {
            ratingValue: Number(vendor.ratingAvg),
            reviewCount: vendor.ratingCount,
          },
        }
      : {}),
  };

  const hero = HERO_BY_CATEGORY[vendor.category] ?? HERO_BY_CATEGORY.Venues;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-cover bg-center shadow-md"
        style={{ backgroundImage: `url("${hero}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
            {vendor.category}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white drop-shadow sm:text-5xl">
            {vendor.businessName}
          </h1>
          <p className="mt-1 text-sm text-white/80">{vendor.baseRegion}</p>
        </div>
        <span className="absolute right-6 top-6 rounded-full bg-green-700 px-3 py-1 text-sm font-bold text-white shadow">
          {Number(vendor.ratingAvg).toFixed(1)}{" "}
          <span className="text-xs font-normal text-white/80">
            ({vendor.ratingCount})
          </span>
        </span>
      </div>
      {vendor.description && (
        <p className="mt-6 leading-relaxed text-neutral-700">
          {vendor.description}
        </p>
      )}
      <a
        href={`/quotes/${encodeURIComponent(vendor.category)}`}
        className="mt-6 inline-block rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700"
      >
        Request a {vendor.category.toLowerCase()} quote →
      </a>

      {canReview && qualifyingLeadId && (
        <form action={submitReview} className="mt-6 rounded-xl border border-neutral-200 p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="leadId" value={qualifyingLeadId} />
          <p className="text-sm font-medium">Rate this vendor (1–5)</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                name="rating"
                value={r}
                className="h-9 w-9 rounded-full border border-neutral-300 text-sm hover:bg-pink-100"
              >
                {r}
              </button>
            ))}
          </div>
        </form>
      )}

      {vendor.reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-semibold">Reviews</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {vendor.reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-neutral-200 p-4"
              >
                <p className="font-medium text-pink-700">
                  {r.rating}/5 {Array(r.rating).fill("★").join("")}
                </p>
                {r.comment && (
                  <p className="mt-1 text-sm text-neutral-600">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
