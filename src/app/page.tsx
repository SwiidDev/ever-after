import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-pink-50 to-white px-4 py-16 text-center">
        <h1 className="mx-auto max-w-2xl font-serif text-4xl font-bold sm:text-5xl">
          Find the best <span className="text-pink-600">wedding</span>{" "}
          professionals in South Africa
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">
          Venues, caterers, photographers and more — free quotes from vetted
          wedding vendors.
        </p>
        <form action="/search" className="mx-auto mt-8 flex max-w-xl gap-2">
          <input
            name="q"
            placeholder="What are you looking for..."
            className="w-full rounded-l-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-pink-500"
          />
          <input
            name="loc"
            defaultValue="Pretoria"
            className="w-40 border border-l-0 border-neutral-300 px-4 py-3 text-sm outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-pink-600 px-6 py-3 text-sm font-medium text-white hover:bg-pink-700"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 font-serif text-2xl font-semibold">
          Popular categories
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              className="group rounded-xl border border-neutral-200 p-4 text-center transition hover:border-pink-400 hover:shadow-md"
            >
              <span className="text-sm font-medium group-hover:text-pink-600">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
