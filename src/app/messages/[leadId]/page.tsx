import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notify, deliverQueued } from "@/lib/notify";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const session = await getSession();
  const vendorId = session?.vendorId;
  const coupleId = session?.coupleId;
  const role = vendorId ? "VENDOR" : coupleId ? "COUPLE" : null;
  if (!role) redirect("/login");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { unlocks: true },
  });
  if (!lead) notFound();

  // Vendor must have unlocked; couple must be the lead's owner
  if (role === "VENDOR") {
    if (!lead.unlocks.some((u) => u.vendorId === vendorId)) notFound();
  } else if (lead.coupleId !== coupleId) {
    notFound();
  }

  // Thread is created lazily on first open by an authorised participant.
  // Couple can only open once at least one vendor has unlocked.
  if (role === "COUPLE" && lead.unlocks.length === 0) notFound();
  const existingThread = await prisma.messageThread.findUnique({
    where: { leadId },
  });
  if (!existingThread) {
    await prisma.messageThread.create({
      data: {
        leadId,
        vendorId: role === "VENDOR" ? (vendorId as string) : lead.unlocks[0].vendorId,
        coupleId: lead.coupleId,
      },
    });
  }
  const thread = await prisma.messageThread.findUniqueOrThrow({
    where: { leadId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  async function send(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { notify, deliverQueued } = await import("@/lib/notify");
    const { cookies } = await import("next/headers");
    const { redirect } = await import("next/navigation");
    const session = await getSession();
    const vendorId = session?.vendorId;
    const coupleId = session?.coupleId;
    const role = vendorId ? "VENDOR" : coupleId ? "COUPLE" : null;
    if (!role) return;
    const leadId = String(formData.get("leadId"));
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    const thread = await prisma.messageThread.findUnique({ where: { leadId } });
    if (!thread) return;
    await prisma.message.create({
      data: { threadId: thread.id, senderRole: role, body },
    });
    if (role === "VENDOR" && thread.coupleId) {
      const couple = await prisma.couple.findUnique({
        where: { id: thread.coupleId },
        select: { userId: true },
      });
      if (couple)
        await notify({
          userId: couple.userId,
          template: "new_message",
          payload: { from: "your wedding vendor", leadId },
        });
    } else if (role === "COUPLE") {
      const vendor = await prisma.vendor.findUnique({
        where: { id: thread.vendorId },
        select: { userId: true, businessName: true },
      });
      if (vendor)
        await notify({
          userId: vendor.userId,
          template: "new_message",
          payload: { from: "the couple", leadId },
        });
    }
    await deliverQueued();
    redirect(`/messages/${leadId}`);
  }

  const other = role === "VENDOR" ? "the couple" : "the vendor";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">
        Messages — {lead.category} lead
      </h1>
      <p className="text-sm text-neutral-500">
        {lead.region} · {lead.budgetBand}
      </p>

      <div className="mt-6 space-y-3">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.senderRole === role
                ? "ml-auto bg-pink-600 text-white"
                : "bg-neutral-100"
            }`}
          >
            {m.body}
            <div
              className={`mt-1 text-[10px] ${
                m.senderRole === role ? "text-pink-200" : "text-neutral-400"
              }`}
            >
              {m.senderRole === role ? "you" : other}
            </div>
          </div>
        ))}
        {thread.messages.length === 0 && (
          <p className="text-sm text-neutral-500">
            No messages yet — say hello.
          </p>
        )}
      </div>

      <form action={send} className="mt-6 flex gap-2">
        <input type="hidden" name="leadId" value={leadId} />
        <input
          name="body"
          required
          placeholder={`Message ${other}...`}
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm"
        />
        <button className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700">
          Send
        </button>
      </form>
    </div>
  );
}
