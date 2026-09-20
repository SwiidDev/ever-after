import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuoteSentPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { slots: { include: { vendor: true } } },
  });
  if (!lead) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="font-serif text-3xl font-bold">Request sent!</h1>
      <p className="mt-2 text-neutral-600">
        {lead.slots.length} matching {lead.category.toLowerCase()} pro
        {lead.slots.length === 1 ? "" : "s"} will receive your details and
        contact you with quotes shortly.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700"
      >
        Back to home
      </Link>
    </div>
  );
}
