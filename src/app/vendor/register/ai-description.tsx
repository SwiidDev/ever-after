"use client";

import { useState } from "react";

/**
 * Description field + AI generator. The textarea is a named form field
 * picked up by the server action; Generate fills it via AI.
 */
export default function AiDescription() {
  const [bullets, setBullets] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function generate() {
    if (!bullets.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/ai/listing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bullets,
          businessName: (document.getElementById("biz-name") as HTMLInputElement)?.value,
          category: (document.getElementById("biz-cat") as HTMLSelectElement)?.value,
        }),
      });
      const json = await res.json();
      if (json.description) {
        setDescription(json.description);
      } else {
        setNote(
          json.error === "AI not configured"
            ? "AI not configured yet — write your description below."
            : "Could not generate — write it yourself below.",
        );
      }
    } catch {
      setNote("Could not generate — write it yourself below.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={bullets}
        onChange={(e) => setBullets(e.target.value)}
        rows={3}
        placeholder="Optional: jot rough points (e.g. 'bush venue, 150 guests, chapel') and let AI write your description"
        className="w-full rounded-lg border border-dashed border-pink-300 bg-pink-50/40 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="rounded-full border border-pink-400 px-4 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50 disabled:opacity-50"
      >
        {busy ? "Generating…" : "✨ Generate description"}
      </button>
      {note && <p className="text-xs text-amber-600">{note}</p>}
      <textarea
        name="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your services..."
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
