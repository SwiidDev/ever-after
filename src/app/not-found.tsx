import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-bold text-pink-600">404</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold">
        We couldn't find that page
      </h1>
      <p className="mt-2 text-neutral-600">
        It might have moved, or never existed. Try one of these instead.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 hover:border-pink-400"
        >
          Browse vendors
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 hover:border-pink-400"
        >
          Pricing
        </Link>
      </div>
      <p className="mt-8 text-xs text-neutral-400">
        {BRAND.name}
      </p>
    </div>
  );
}
