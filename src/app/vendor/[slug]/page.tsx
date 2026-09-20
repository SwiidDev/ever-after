import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: PageProps<"/vendor/[slug]">) {
  const { slug } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { slug } });
  return { title: vendor ? `${vendor.businessName} — Wed Do` : "Not found" };
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
  const jar = await cookies();
  const coupleId = jar.get("weddo_couple")?.value;
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
    const jar = await cookies();
    const coupleId = jar.get("weddo_couple")?.value;
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200">
        <span className="font-serif text-5xl text-pink-400">
          {vendor.businessName.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            {vendor.businessName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {vendor.category} · {vendor.baseRegion}
          </p>
        </div>
        <span className="rounded bg-green-700 px-2 py-1 text-sm font-bold text-white">
          {Number(vendor.ratingAvg).toFixed(1)} ({vendor.ratingCount} reviews)
        </span>
      </div>
      {vendor.description && (
        <p className="mt-4 leading-relaxed text-neutral-700">
          {vendor.description}
        </p>
      )}
      <button
        type="button"
        className="mt-6 rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700"
      >
        Request a quote
      </button>

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
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-xl font-semibold">Reviews</h2>
          <div className="space-y-2">
            {vendor.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <span className="font-medium text-pink-700">{r.rating}/5</span>
                {r.comment && <p className="text-neutral-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
