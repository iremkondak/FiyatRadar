import Link from "next/link";
import Logo from "../components/Logo";
import ResultsClient from "./ResultsClient";

type ResultsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const params = await searchParams;
  const searchedProduct = params.q?.trim() || "";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
        <Logo />
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-emerald-400 hover:text-emerald-300"
          >
            Ana sayfa
          </Link>
        </header>

        <form
          action="/sonuclar"
          method="GET"
          className="mb-12 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 md:flex-row"
        >
          <input
            type="text"
            name="q"
            defaultValue={searchedProduct}
            placeholder="Başka bir ürün ara..."
            required
            className="min-h-14 flex-1 rounded-2xl bg-white px-5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-400/30"
          />

          <button
            type="submit"
            className="min-h-14 rounded-2xl bg-emerald-400 px-8 font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Yeniden Tara
          </button>
        </form>

        <section className="mb-8">
          <p className="text-sm font-bold text-emerald-400">
            Arama sonuçları
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
            {searchedProduct || "Ürün araması"}
          </h1>

          <p className="mt-3 text-slate-400">
            Mağazalardaki fiyat ve stok durumlarını karşılaştır.
          </p>
        </section>

        <ResultsClient searchedProduct={searchedProduct} />

        <p className="mt-5 text-center text-xs text-slate-500">
          Fiyatlar şimdilik uygulamayı test etmek için kullanılan örnek
          verilerdir.
        </p>
      </div>
    </main>
  );
}
