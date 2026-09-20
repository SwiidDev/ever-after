import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, haversineKm } from "@/lib/categories";

export const dynamic = "force-dynamic";

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

  // Optional geo filter: radius (km) around Pretoria city centre by default
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <form
        action="/search"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search vendors..."
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-pink-500"
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
          className="rounded-lg bg-pink-600 px-5 py-2 font-medium text-white hover:bg-pink-700"
        >
          Filter
        </button>
      </form>

      <h1 className="mb-6 font-serif text-2xl font-semibold">
        {category || "All wedding vendors"}{" "}
        <span className="text-sm font-normal text-neutral-500">
          ({filtered.length} result{filtered.length === 1 ? "" : "s"})
        </span>
      </h1>

      {filtered.length === 0 ? (
        <p className="text-neutral-500">
          No vendors found.{" "}
          <Link href="/search" className="text-pink-600 underline">
            Clear filters
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/vendor/${v.slug}`}
              className="group overflow-hidden rounded-xl border border-neutral-200 transition hover:border-pink-400 hover:shadow-md"
            >
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                <span className="font-serif text-3xl text-pink-400">
                  {v.businessName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-pink-700 group-hover:underline">
                    {v.businessName}
                  </h2>
                  <span className="rounded bg-green-700 px-1.5 py-0.5 text-xs font-bold text-white">
                    {Number(v.ratingAvg).toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {v.category} · {v.baseRegion}
                </p>
                {v.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                    {v.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
