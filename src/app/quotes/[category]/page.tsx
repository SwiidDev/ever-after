import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: encodeURIComponent(category) }));
}

const BUDGET_BANDS = [
  "Under R5,000",
  "R5,000 – R15,000",
  "R15,000 – R40,000",
  "R40,000 – R80,000",
  "R80,000+",
];

export default async function RequestQuotePage({
  params,
}: { params: Promise<{ category: string }> }) {
  const { category: raw } = await params;
  const category = decodeURIComponent(raw);
  if (!CATEGORIES.includes(category as never)) notFound();

  async function createLead(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const cat = String(formData.get("category") ?? "");
    const region = String(formData.get("region") ?? "").trim() || "Pretoria";
    const contactName = String(formData.get("contactName") ?? "").trim();
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const contactPhone = String(formData.get("contactPhone") ?? "").trim();
    const budgetBand = String(formData.get("budgetBand") ?? "");
    const guestCountRaw = String(formData.get("guestCount") ?? "");
    const guestCount = guestCountRaw ? Number(guestCountRaw) : null;
    const eventDateRaw = String(formData.get("eventDate") ?? "");
    const notes = String(formData.get("notes") ?? "").trim() || null;
    if (!contactName || !contactEmail || !contactPhone || !budgetBand) return;

    const lead = await prisma.lead.create({
      data: {
        category: cat,
        region,
        budgetBand,
        guestCount,
        eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
        contactName,
        contactEmail,
        contactPhone,
        notes,
        // attach to the logged-in couple (if any) so messaging works later
        coupleId: await (async () => {
          const { cookies } = await import("next/headers");
          return (await cookies()).get("weddo_couple")?.value ?? null;
        })(),
      },
    });

    // Distribute to up to 5 matching vendors, fair rotation: fewest
    // unlocks first, then rating
    const candidates = await prisma.vendor.findMany({
      where: { status: "APPROVED", category: cat },
      orderBy: [{ leadUnlocks: { _count: "asc" } }, { ratingAvg: "desc" }],
      take: 5,
    });
    await prisma.leadSlot.createMany({
      data: candidates.map((v, i) => ({ leadId: lead.id, vendorId: v.id, position: i + 1 })),
    });

    const { redirect } = await import("next/navigation");
    redirect(`/quotes/sent/${lead.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-1 font-serif text-3xl font-bold">
        Request {category} quotes
      </h1>
      <p className="mb-6 text-sm text-neutral-600">
        Free — we match you with up to 5 wedding {category.toLowerCase()}{" "}
        pros who will contact you with quotes.
      </p>
      <form action={createLead} className="space-y-3">
        <input type="hidden" name="category" value={category} />
        <input
          name="eventDate"
          type="date"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="region"
          defaultValue="Pretoria"
          placeholder="City / area"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="guestCount"
          type="number"
          min={0}
          placeholder="Guest count (optional)"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <select
          name="budgetBand"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Budget range...</option>
          {BUDGET_BANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          name="contactName"
          required
          placeholder="Your name"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="contactEmail"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="contactPhone"
          required
          placeholder="Phone"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <textarea
          name="notes"
          rows={3}
          placeholder="Tell us more about what you need..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <label className="flex items-start gap-2 text-xs text-neutral-600">
          <input type="checkbox" required className="mt-0.5" />
          I agree that Wed Do may share my details with up to 5 matching
          wedding professionals (POPIA).
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-pink-600 px-6 py-3 font-medium text-white hover:bg-pink-700"
        >
          Get free quotes
        </button>
      </form>
    </div>
  );
}
