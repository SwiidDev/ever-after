import { getCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const couple = await getCouple();
  const tasks = await prisma.checklistItem.findMany({
    where: { coupleId: couple.id },
    orderBy: [{ monthsOut: "asc" }, { id: "asc" }],
  });

  const byMonth = new Map<number, typeof tasks>();
  for (const t of tasks) {
    const list = byMonth.get(t.monthsOut) ?? [];
    list.push(t);
    byMonth.set(t.monthsOut, list);
  }

  async function toggle(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    const id = String(formData.get("id"));
    const item = await prisma.checklistItem.findFirst({
      where: { id, coupleId: c.id },
    });
    if (!item) return;
    await prisma.checklistItem.update({
      where: { id },
      data: { done: !item.done },
    });
    const { redirect } = await import("next/navigation");
    redirect("/checklist");
  }

  async function addTask(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    const title = String(formData.get("title") ?? "").trim();
    const monthsOut = Number(formData.get("monthsOut") ?? 12);
    if (!title || !(monthsOut >= 0 && monthsOut <= 24)) return;
    await prisma.checklistItem.create({
      data: { coupleId: c.id, title, monthsOut },
    });
    const { redirect } = await import("next/navigation");
    redirect("/checklist");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Checklist</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {tasks.filter((t) => t.done).length}/{tasks.length} done
      </p>

      <form
        action={addTask}
        className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm"
      >
        <input
          name="title"
          required
          placeholder="New task..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <select name="monthsOut" className="rounded-lg border border-neutral-300 px-3 py-2">
          {Array.from({ length: 13 }, (_, i) => 12 - i).map((m) => (
            <option key={m} value={m}>
              {m} month{m === 1 ? "" : "s"} out
            </option>
          ))}
        </select>
        <button className="rounded-full bg-pink-600 px-4 py-2 font-medium text-white hover:bg-pink-700">
          Add
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {[...byMonth.entries()].map(([months, list]) => {
          const done = list.filter((t) => t.done).length;
          return (
            <div key={months}>
              <h2 className="mb-2 font-medium text-neutral-700">
                {months} month{months === 1 ? "" : "s"} before{" "}
                <span className="text-xs text-neutral-400">
                  ({done}/{list.length})
                </span>
              </h2>
              <div className="space-y-1">
                {list.map((t) => (
                  <form key={t.id} action={toggle}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                        t.done
                          ? "border-green-200 bg-green-50 text-neutral-400 line-through"
                          : "border-neutral-200 hover:border-pink-300"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-xs ${
                          t.done ? "border-green-500 bg-green-500 text-white" : "border-neutral-400"
                        }`}
                      >
                        {t.done && "✓"}
                      </span>
                      {t.title}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
