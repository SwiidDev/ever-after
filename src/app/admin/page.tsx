import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pending = await prisma.vendor.findMany({
    where: { status: "PENDING" },
  });
  const approved = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
  });

  async function setStatus(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    if (!["APPROVED", "SUSPENDED"].includes(status)) return;
    await prisma.vendor.update({
      where: { id },
      data: {
        status: status as "APPROVED" | "SUSPENDED",
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Admin</h1>

      <h2 className="mb-3 font-medium">
        Pending approval ({pending.length})
      </h2>
      <div className="mb-8 space-y-2">
        {pending.length === 0 && (
          <p className="text-sm text-neutral-500">No pending vendors.</p>
        )}
        {pending.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div>
              <p className="font-medium">{v.businessName}</p>
              <p className="text-xs text-neutral-500">
                {v.category} · {v.baseRegion}
              </p>
            </div>
            <form action={setStatus}>
              <input type="hidden" name="id" value={v.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                Approve
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-medium">Approved ({approved.length})</h2>
      <div className="space-y-2">
        {approved.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div>
              <p className="font-medium">{v.businessName}</p>
              <p className="text-xs text-neutral-500">
                {v.category} · {v.baseRegion}
              </p>
            </div>
            <form action={setStatus}>
              <input type="hidden" name="id" value={v.id} />
              <input type="hidden" name="status" value="SUSPENDED" />
              <button className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Suspend
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
