import { getCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const couple = await getCouple();
  const ideas = await prisma.idea.findMany({
    where: { coupleId: couple.id },
    orderBy: { createdAt: "desc" },
  });

  async function addIdea(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    const title = String(formData.get("title") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim() || null;
    const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!title) return;
    await prisma.idea.create({ data: { coupleId: c.id, title, note, imageUrl, tags } });
    const { redirect } = await import("next/navigation");
    redirect("/ideas");
  }

  async function removeIdea(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    await prisma.idea.deleteMany({
      where: { id: String(formData.get("id")), coupleId: c.id },
    });
    const { redirect } = await import("next/navigation");
    redirect("/ideas");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Ideas board</h1>

      <form
        action={addIdea}
        className="mt-4 space-y-2 rounded-xl border border-neutral-200 p-3 text-sm"
      >
        <div className="flex flex-wrap gap-2">
          <input name="title" required placeholder="Idea title" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="imageUrl" placeholder="Image URL (optional)" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2" />
        </div>
        <input name="note" placeholder="Notes (optional)" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
        <div className="flex flex-wrap gap-2">
          <input name="tags" placeholder="tags, comma, separated" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2" />
          <button className="rounded-full bg-pink-600 px-4 py-2 font-medium text-white hover:bg-pink-700">
            Save idea
          </button>
        </div>
      </form>

      <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {ideas.map((i) => (
          <div key={i.id} className="mb-4 break-inside-avoid rounded-xl border border-neutral-200 p-4">
            {i.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.imageUrl} alt={i.title} className="mb-2 w-full rounded-lg" />
            )}
            <p className="font-medium">{i.title}</p>
            {i.note && <p className="mt-1 text-sm text-neutral-600">{i.note}</p>}
            {i.tags.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1">
                {i.tags.map((t) => (
                  <span key={t} className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700">
                    {t}
                  </span>
                ))}
              </p>
            )}
            <form action={removeIdea} className="mt-2 text-right">
              <input type="hidden" name="id" value={i.id} />
              <button className="text-xs text-red-400 hover:text-red-600">remove</button>
            </form>
          </div>
        ))}
        {ideas.length === 0 && (
          <p className="text-sm text-neutral-500">
            No ideas yet — save your first inspiration above.
          </p>
        )}
      </div>
    </div>
  );
}
