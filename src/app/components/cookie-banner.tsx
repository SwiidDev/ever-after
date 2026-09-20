"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("ea-cookies") === "ok") return;
    setOpen(true);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl p-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#111] p-4 text-neutral-200 shadow-2xl">
        <p className="flex-1 text-sm">
          {BRAND.name} uses essential cookies to keep you signed in and
          remember your preferences. See our{" "}
          <Link href="/privacy" className="text-[var(--gold)] underline">
            privacy notice
          </Link>
          .
        </p>
        <button
          onClick={() => {
            localStorage.setItem("ea-cookies", "ok");
            setOpen(false);
          }}
          className="rounded-full bg-[var(--gold)] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black hover:bg-[var(--gold-soft)]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
