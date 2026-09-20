"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/signout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-sm text-neutral-500 hover:text-pink-600"
    >
      {busy ? "..." : "Sign out"}
    </button>
  );
}
