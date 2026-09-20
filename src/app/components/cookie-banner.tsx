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
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
        <p className="flex-1 text-sm text-neutral-700">
          {BRAND.name} uses essential cookies to keep you signed in and
          remember your preferences. See our{" "}
          <Link href="/privacy" className="text-pink-600 underline">
            privacy notice
          </Link>
          .
        </p>
        <button
          onClick={() => {
            localStorage.setItem("ea-cookies", "ok");
            setOpen(false);
          }}
          className="rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
