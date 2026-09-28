import Logo from "./components/Logo";
import SearchForm from "./components/SearchForm";

const steps = [
  {
    number: "01",
    title: "Ürünü ara",
    description:
      "Ürün adını, model numarasını veya ürün bağlantısını arama alanına yaz.",
  },
  {
    number: "02",
    title: "Fiyatları karşılaştır",
    description:
      "FiyatRadar mağazalardaki fiyat, kargo ve stok bilgilerini karşılaştırsın.",
  },
  {
    number: "03",
    title: "En uygununu seç",
    description:
      "Sonuçları en uygun fiyattan pahalıya sırala ve mağazaya yönel.",
  },
];

const stores = [
  "Teknosa",
  "MediaMarkt",
  "Hepsiburada",
  "Trendyol",
  "Amazon",
  "n11",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Üst menü */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Logo />

          <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
            <a
              href="#nasil-calisir"
              className="transition hover:text-emerald-300"
            >
              Nasıl Çalışır?
            </a>

            <a
              href="#magazalar"
              className="transition hover:text-emerald-300"
            >
              Mağazalar
            </a>

            <a
              href="#hakkinda"
              className="transition hover:text-emerald-300"
            >
              Hakkında
            </a>
          </nav>
        </div>
      </header>

      {/* Ana tanıtım alanı */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto flex min-h-[760px] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Binlerce ürün fiyatını tek ekranda karşılaştır
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold leading-tight md:text-7xl">
            En uygun fiyatı
            <span className="block text-emerald-400">
              radara al.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Ürün adını, model kodunu veya bağlantısını gir.
            FiyatRadar farklı mağazalardaki fiyatları ve stok
            durumlarını senin için karşılaştırsın.
          </p>

          <SearchForm />
        </div>
      </section>

      {/* Nasıl çalışır bölümü */}
      <section
        id="nasil-calisir"
        className="scroll-mt-24 border-t border-white/10 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
              Çok kolay
            </p>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              FiyatRadar nasıl çalışır?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Aradığın ürünü bulmak ve mağazaları karşılaştırmak
              için yalnızca üç adım yeterli.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-emerald-400/50"
              >
                <span className="text-sm font-extrabold text-emerald-400">
                  {step.number}
                </span>

                <h3 className="mt-8 text-2xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mağazalar bölümü */}
      <section
        id="magazalar"
        className="scroll-mt-24 border-y border-white/10 bg-slate-900/60 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
            Mağazalar
          </p>

          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
            Tek tek mağaza gezmene gerek kalmasın
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            İlk sürümde örnek mağaza sonuçlarını kullanıyoruz.
            Daha sonra gerçek ürün ve fiyat bağlantılarını ekleyeceğiz.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stores.map((store) => (
              <div
                key={store}
                className="flex min-h-24 items-center justify-center rounded-2xl border border-white/10 bg-white px-4 font-bold text-slate-900 shadow-lg"
              >
                {store}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hakkında bölümü */}
      <section
        id="hakkinda"
        className="scroll-mt-24 px-6 py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-400/15 to-white/5 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
              FiyatRadar
            </p>

            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              Daha bilinçli alışveriş için tasarlandı.
            </h2>
          </div>

          <div className="flex flex-col justify-center">
            <p className="leading-8 text-slate-300">
              FiyatRadar, aynı ürünü farklı mağazalarda arayıp
              fiyat, kargo ve stok bilgilerini tek bir yerde
              göstermeyi amaçlayan bir fiyat karşılaştırma
              uygulamasıdır.
            </p>

            <p className="mt-5 leading-8 text-slate-400">
              Şu anda geliştirme aşamasındadır. Gösterilen fiyatlar
              örnek verilerden oluşmaktadır.
            </p>
          </div>
        </div>
      </section>

      {/* Alt bölüm */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 FiyatRadar</p>

          <p>En uygun fiyatı radara al.</p>
        </div>
      </footer>
    </main>
  );
}