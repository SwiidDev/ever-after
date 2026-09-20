import { getSession } from "@/lib/session";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { unlockLead, unlockCost, grantCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function VendorLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const session = await getSession();
  const vendorId = session?.vendorId;
  if (!vendorId || session?.role !== "VENDOR") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-neutral-600">Please sign in as a vendor.</p>
        <Link
          href="/vendor/login"
          className="rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { ledgerEntries: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!vendor) {
    return <div className="p-10 text-center">Vendor not found.</div>;
  }

  const slots = await prisma.leadSlot.findMany({
    where: { vendorId },
    include: {
      lead: { include: { unlocks: true, _count: { select: { slots: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  async function doUnlock(formData: FormData) {
    "use server";
    const leadId = String(formData.get("leadId"));
    const sess = await getSession();
    const vid = sess?.vendorId;
    if (!vid) return;
    const result = await unlockLead({
      vendorId: vid,
      leadId,
      idempotencyKey: `unlock-${vid}-${leadId}`,
    });
    const { redirect } = await import("next/navigation");
    if (result.ok) {
      // Notify the couple (if the lead belongs to a signed-up couple)
      const { notify, deliverQueued } = await import("@/lib/notify");
      const { prisma } = await import("@/lib/prisma");
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { couple: { select: { userId: true } }, unlocks: { include: { vendor: { select: { businessName: true } } } } },
      });
      const lastUnlock = lead?.unlocks[lead.unlocks.length - 1];
      if (lead?.couple?.userId && lastUnlock)
        await notify({
          userId: lead.couple.userId,
          template: "lead_unlocked",
          payload: { vendorName: lastUnlock.vendor.businessName, leadId },
        });
      await deliverQueued();
      redirect("/vendor/leads");
    } else
      redirect(
        `/vendor/leads?msg=${encodeURIComponent(
          result.reason === "insufficient_credits"
            ? "Not enough credits — buy a credit pack below."
            : result.reason.replace(/_/g, " "),
        )}`,
      );
  }

  async function buyBundle(formData: FormData) {
    "use server";
    const bundleId = String(formData.get("bundleId"));
    const sess = await getSession();
    const vid = sess?.vendorId;
    if (!vid) return;
    const bundle = await prisma.creditBundle.findUnique({ where: { id: bundleId } });
    if (!bundle) return;
    // Dev path: simulate a settled PayFast payment. The real ITN webhook
    // lands at /api/payfast/itn with signature verification (M3).
    await grantCredits({
      vendorId: vid,
      credits: bundle.credits,
      type: "PURCHASE",
      idempotencyKey: `dev-purchase-${bundle.id}-${vid}-${Date.now()}`,
      note: `Dev purchase: ${bundle.name}`,
    });
    const { redirect } = await import("next/navigation");
    redirect("/vendor/leads?msg=Purchase%20complete");
  }

  const bundles = await prisma.creditBundle.findMany({ where: { active: true } });
  const { msg } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold">Lead inbox</h1>
          <p className="text-sm text-neutral-500">{vendor.businessName}</p>
        </div>
        <div className="rounded-full bg-pink-50 px-4 py-2 text-sm">
          Balance:{" "}
          <span className="font-bold text-pink-700">{vendor.creditBalance} credits</span>
        </div>
      </div>

      {msg && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {msg}
        </p>
      )}

      <h2 className="mb-3 font-medium">Your leads ({slots.length})</h2>
      <div className="mb-8 space-y-3">
        {slots.length === 0 && (
          <p className="text-sm text-neutral-500">
            No leads yet. They arrive automatically when a couple requests your
            category.
          </p>
        )}
        {slots.map(({ lead }) => {
          const unlocked = lead.unlocks.some((u) => u.vendorId === vendorId);
          const cost = unlockCost(lead.category);
          return (
            <div
              key={lead.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{lead.category} lead</p>
                  <p className="text-xs text-neutral-500">
                    {lead.region} · {lead.budgetBand}
                    {lead.guestCount ? ` · ${lead.guestCount} guests` : ""}
                    {lead.eventDate
                      ? ` · ${lead.eventDate.toISOString().slice(0, 10)}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">
                  {lead.unlocks.length}/{lead.maxSlots} unlocked
                </span>
              </div>
              {unlocked ? (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm">
                  <p className="font-medium text-green-800">Unlocked</p>
                  <p className="mt-1">
                    {lead.contactName} · {lead.contactPhone}
                    <br />
                    {lead.contactEmail}
                  </p>
                  {lead.notes && (
                    <p className="mt-2 text-neutral-600">{lead.notes}</p>
                  )}
                  <a
                    href={`/messages/${lead.id}`}
                    className="mt-2 inline-block rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                  >
                    Message the couple
                  </a>
                </div>
              ) : lead.status === "EXHAUSTED" ? (
                <p className="mt-3 text-sm text-neutral-400">
                  Lead fully unlocked by other vendors.
                </p>
              ) : (
                <form action={doUnlock} className="mt-3">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    Unlock contact details — {cost} credits
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 font-medium">Credit packs</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {bundles.map((b) => (
          <form key={b.id} action={buyBundle} className="rounded-xl border border-neutral-200 p-4 text-center">
            <input type="hidden" name="bundleId" value={b.id} />
            <p className="font-bold text-pink-700">{b.credits} credits</p>
            <p className="text-sm text-neutral-500">
              R{(b.priceCents / 100).toFixed(0)}
            </p>
            <button className="mt-3 w-full rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700">
              Buy
            </button>
          </form>
        ))}
      </div>

      <h2 className="mb-3 font-medium">Recent credit activity</h2>
      <div className="space-y-1 text-sm">
        {vendor.ledgerEntries.map((e) => (
          <p key={e.id} className="flex justify-between border-b border-neutral-100 py-1.5">
            <span>
              {e.type}
              {e.note ? ` — ${e.note}` : ""}
            </span>
            <span className={e.deltaCredits > 0 ? "text-green-700" : "text-red-600"}>
              {e.deltaCredits > 0 ? "+" : ""}
              {e.deltaCredits} ({e.balanceAfter})
            </span>
          </p>
        ))}
        {vendor.ledgerEntries.length === 0 && (
          <p className="text-neutral-500">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
