"use client";

import { useEffect, useState } from "react";

type Offer = {
  id: number;
  store: string;
  price: number;
  shipping: number;
  inStock: boolean;
  productUrl: string;
};

type SearchResponse = {
  searchedProduct: string;
  resultCount: number;
  offers: Offer[];
};

type ResultsClientProps = {
  searchedProduct: string;
};

type SortOption = "cheapest" | "expensive";

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ResultsClient({
  searchedProduct,
}: ResultsClientProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [sortOption, setSortOption] =
    useState<SortOption>("cheapest");

  const [onlyInStock, setOnlyInStock] = useState(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);

  useEffect(() => {
    async function fetchOffers() {
      if (!searchedProduct) {
        setErrorMessage("Aranacak ürün bulunamadı.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchedProduct)}&t=${Date.now()}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error("Fiyat sonuçları alınamadı.");
        }

        const data: SearchResponse = await response.json();
        setOffers(data.offers);
      } catch {
        setErrorMessage(
          "Fiyatlar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, [searchedProduct]);

  const inStockOffers = offers.filter((offer) => offer.inStock);

  const cheapestOffer = [...inStockOffers].sort(
    (a, b) =>
      a.price + a.shipping - (b.price + b.shipping),
  )[0];

  const mostExpensiveOffer = [...inStockOffers].sort(
    (a, b) =>
      b.price + b.shipping - (a.price + a.shipping),
  )[0];

  const cheapestPrice = cheapestOffer
    ? cheapestOffer.price + cheapestOffer.shipping
    : 0;

  const mostExpensivePrice = mostExpensiveOffer
    ? mostExpensiveOffer.price + mostExpensiveOffer.shipping
    : 0;

  const savingAmount = mostExpensivePrice - cheapestPrice;

  const filteredOffers = [...offers]
    .filter((offer) => {
      if (onlyInStock && !offer.inStock) {
        return false;
      }

      if (freeShippingOnly && offer.shipping !== 0) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const totalA = a.price + a.shipping;
      const totalB = b.price + b.shipping;

      if (sortOption === "expensive") {
        return totalB - totalA;
      }

      return totalA - totalB;
    });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

        <p className="mt-5 text-lg font-semibold">
          Mağazalardaki fiyatlar taranıyor...
        </p>

        <p className="mt-2 text-sm text-slate-400">
          En uygun seçenekler hazırlanıyor.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-10 text-center">
        <p className="text-xl font-bold text-red-300">
          Bir sorun oluştu
        </p>

        <p className="mt-2 text-sm text-red-200">
          {errorMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Fiyat özeti */}
      <section className="mb-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-sm font-semibold text-emerald-300">
            En uygun fiyat
          </p>

          <p className="mt-3 text-3xl font-extrabold">
            {cheapestOffer
              ? formatPrice(cheapestPrice)
              : "Bulunamadı"}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {cheapestOffer?.store || "Stokta ürün yok"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold text-slate-300">
  Bulunan teklif
</p>

          <p className="mt-3 text-3xl font-extrabold">
            {offers.length}
          </p>

          <p className="mt-2 text-sm text-slate-400">
           {inStockOffers.length} teklif stokta
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-slate-300">
            Olası tasarruf
          </p>

          <p className="mt-3 text-3xl font-extrabold">
            {formatPrice(savingAmount)}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            En pahalı seçeneğe göre
          </p>
        </div>
      </section>

      {/* Filtreler */}
      <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(event) =>
                  setOnlyInStock(event.target.checked)
                }
                className="h-5 w-5 accent-emerald-400"
              />

              <span className="text-sm font-medium text-slate-200">
                Sadece stokta olanlar
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={freeShippingOnly}
                onChange={(event) =>
                  setFreeShippingOnly(event.target.checked)
                }
                className="h-5 w-5 accent-emerald-400"
              />

              <span className="text-sm font-medium text-slate-200">
                Ücretsiz kargo
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="text-sm text-slate-400"
            >
              Sıralama:
            </label>

            <select
              id="sort"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              <option value="cheapest">
                En ucuzdan pahalıya
              </option>

              <option value="expensive">
                En pahalıdan ucuza
              </option>
            </select>
          </div>
        </div>
      </section>

      <p className="mb-4 text-sm text-slate-400">
        {filteredOffers.length} mağaza gösteriliyor.
      </p>

      {filteredOffers.length > 0 ? (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          {filteredOffers.map((offer) => {
            const totalPrice = offer.price + offer.shipping;
            const isCheapest =
              offer.id === cheapestOffer?.id &&
              sortOption === "cheapest";

            return (
              <article
                key={offer.id}
                className="flex flex-col gap-6 border-b border-slate-200 p-6 text-slate-900 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-extrabold">
                    {offer.store.charAt(0)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {offer.store}
                      </h2>

                      {isCheapest && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          En uygun
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        offer.inStock
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {offer.inStock
                        ? "Stokta var"
                        : "Stokta yok"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
                  <div className="md:text-right">
                    <p className="text-sm text-slate-500">
                      {offer.shipping === 0
                        ? "Ücretsiz kargo"
                        : `Kargo: ${formatPrice(offer.shipping)}`}
                    </p>

                    <p className="mt-1 text-2xl font-extrabold">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>

                  {offer.inStock ? (
                    <a
                      href={offer.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-slate-950 px-6 py-3 text-center font-semibold text-white transition hover:bg-emerald-400 hover:text-slate-950"
                    >
                      Mağazaya Git
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl bg-slate-300 px-6 py-3 font-semibold text-slate-500"
                    >
                      Tükendi
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-xl font-bold">
            Bu filtrelere uygun mağaza bulunamadı.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Filtrelerden birini kaldırarak tekrar dene.
          </p>
        </div>
      )}
    </div>
  );
}