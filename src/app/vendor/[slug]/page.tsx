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
    include: { reviews: true },
  });
  if (!vendor || vendor.status !== "APPROVED") notFound();

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
    </div>
  );
}
