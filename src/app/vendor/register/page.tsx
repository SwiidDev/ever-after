import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

async function registerVendor(formData: FormData) {
  "use server";
  const businessName = String(formData.get("businessName") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const baseRegion = String(formData.get("baseRegion") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!businessName || !baseRegion || !CATEGORIES.includes(category as never))
    return;

  const slugBase = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = slugBase;
  let i = 2;
  while (await prisma.vendor.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${i++}`;
  }

  // Placeholder owner user — replaced by real auth in the next milestone
  const email = `pending+${Date.now()}@weddo.local`;
  const user = await prisma.user.create({ data: { email, role: "VENDOR" } });
  await prisma.vendor.create({
    data: {
      userId: user.id,
      businessName,
      slug,
      category,
      baseRegion,
      description,
      status: "PENDING",
    },
  });
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-2 font-serif text-3xl font-bold">
        Free Business Listing
      </h1>
      <p className="mb-6 text-sm text-neutral-600">
        List your wedding business for free. Once approved, couples will find
        you in search — and you can receive paid leads.
      </p>
      <form
        action={async (fd) => {
          "use server";
          await registerVendor(fd);
        }}
        className="space-y-3"
      >
        <input
          name="businessName"
          required
          placeholder="Business name"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
        />
        <select
          name="category"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
        >
          <option value="">Choose category...</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="baseRegion"
          required
          placeholder="City / region (e.g. Pretoria)"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
        />
        <textarea
          name="description"
          rows={4}
          placeholder="Describe your services..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-pink-600 px-6 py-3 font-medium text-white hover:bg-pink-700"
        >
          Submit listing
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        After submission your listing goes to{" "}
        <Link href="/admin" className="text-pink-600 underline">
          admin approval
        </Link>{" "}
        before appearing in search.
      </p>
    </div>
  );
}
