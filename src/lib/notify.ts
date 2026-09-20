import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

type NotificationInput = {
  userId: string;
  template: string;
  payload: Record<string, unknown>;
  channel?: "EMAIL" | "SMS";
};

/**
 * Outbox pattern: queue a notification in the same logical step as the
 * state change that triggered it. Delivery is via deliverQueued() —
 * currently logs to console (dev transport); swap for Resend/Clickatell
 * by setting env keys in M5 without touching callers.
 */
export async function notify(input: NotificationInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      channel: input.channel ?? "EMAIL",
      template: input.template,
      payload: input.payload as never,
    },
  });
}

export async function deliverQueued(limit = 20) {
  const queued = await prisma.notification.findMany({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  for (const n of queued) {
    try {
      const to = await prisma.user.findUnique({
        where: { id: n.userId },
        select: { email: true },
      });
      // Dev transport — replace with provider call in M5.
      console.log(
        `[notify:${n.channel}] to=${to?.email} template=${n.template}`,
        JSON.stringify(n.payload),
      );
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch {
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: "FAILED" },
      });
    }
  }
  return queued.length;
}

export const notificationCopy = {
  lead_unlocked: {
    subject: `${BRAND.name}: a wedding pro has your details`,
    body: (p: { vendorName: string }) =>
      `${p.vendorName} received your enquiry and will be in touch shortly.`,
  },
  new_message: {
    subject: `${BRAND.name}: new message`,
    body: (p: { from: string }) => `You have a new message from ${p.from}.`,
  },
} as const;
