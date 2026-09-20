import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, haversineKm } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PHOTO: Record<string, string> = {
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

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q);
  const category = one(sp.category);
  const radius = one(sp.radius);

  const vendors = await prisma.vendor.findMany({
    where: {
      status: "APPROVED",
      category: category || undefined,
      ...(q
        ? {
            OR: [
              { businessName: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { ratingAvg: "desc" },
  });

  const PTA = { lat: -25.7545, lng: 28.1889 };
  const radiusKm = Number(radius) || 0;
  const filtered = radiusKm
    ? vendors.filter(
        (v) =>
          v.baseLat != null &&
          v.baseLng != null &&
          haversineKm(PTA.lat, PTA.lng, Number(v.baseLat), Number(v.baseLng)) <=
            radiusKm,
      )
    : vendors;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold">
        {category || "Browse all vendors"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {filtered.length} result{filtered.length === 1 ? "" : "s"} ·{" "}
        Verified South African wedding businesses
      </p>

      <form
        action="/search"
        className="my-6 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-sm shadow-sm"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or keyword..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-pink-500"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-pink-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="radius"
          type="number"
          min={0}
          defaultValue={radius}
          placeholder="Radius km"
          className="w-28 rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          className="rounded-full bg-pink-600 px-5 py-2 font-medium text-white hover:bg-pink-700"
        >
          Filter
        </button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500">
            No vendors found.{" "}
            <Link href="/search" className="text-pink-600 underline">
              Clear filters
            </Link>
          </p>
          <Link
            href="/vendor/register"
            className="mt-4 inline-block rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            Free vendor listing →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/vendor/${v.slug}`}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-pink-400 hover:shadow-lg"
            >
              <div
                className="relative aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage: `url("${PHOTO[v.category] ?? PHOTO.Venues}")`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute right-3 top-3 rounded-full bg-green-700 px-2 py-1 text-xs font-bold text-white shadow">
                  {Number(v.ratingAvg).toFixed(1)}
                </span>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
                  {v.category}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-serif text-lg font-semibold group-hover:text-pink-700">
                  {v.businessName}
                </h2>
                <p className="text-xs text-neutral-500">{v.baseRegion}</p>
                {v.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                    {v.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-neutral-500">
                    {v.ratingCount} reviews
                  </span>
                  <span className="text-pink-600 group-hover:underline">
                    View profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
