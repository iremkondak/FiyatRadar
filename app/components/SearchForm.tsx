"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const popularSearches = [
  "iPhone 17",
  "MacBook Air",
  "Dyson V15",
  "PlayStation 5",
  "Samsung TV",
];

export default function SearchForm() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  function goToResults(product: string) {
    const cleanedProduct = product.trim();

    if (!cleanedProduct) {
      alert("Lütfen bir ürün adı veya model kodu yaz.");
      return;
    }

    router.push(`/sonuclar?q=${encodeURIComponent(cleanedProduct)}`);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToResults(searchText);
  }

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="mt-10 flex w-full max-w-3xl flex-col gap-3 rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur md:flex-row"
      >
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Örneğin: Bosch KGN56XLE0N buzdolabı"
          className="min-h-16 flex-1 rounded-2xl bg-white px-5 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-400/30"
        />

        <button
          type="submit"
          className="min-h-16 rounded-2xl bg-emerald-400 px-8 text-lg font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          Fiyatları Tara
        </button>
      </form>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm text-slate-400">Popüler:</span>

        {popularSearches.map((product) => (
          <button
            type="button"
            key={product}
            onClick={() => goToResults(product)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            {product}
          </button>
        ))}
      </div>
    </>
  );
}