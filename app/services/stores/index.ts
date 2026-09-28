import { searchAmazon } from "./amazon";
import { searchTeknosa } from "./teknosa";
import { searchMediaMarkt } from "./mediamarkt";
import type {
  StoreOffer,
  StoreSearchResult,
} from "./types";

export type CombinedSearchResult = {
  offers: StoreOffer[];
  storeResults: StoreSearchResult[];
};

export async function searchAllStores(
  query: string,
): Promise<CombinedSearchResult> {
    const storeNames = [
        "Amazon",
        "Teknosa",
        "MediaMarkt",
      ];
      
      const searches = [
        searchAmazon(query),
        searchTeknosa(query),
        searchMediaMarkt(query),
      ];

  const settledResults = await Promise.allSettled(searches);

  const storeResults: StoreSearchResult[] =
    settledResults.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      return {
        store: storeNames[index] || "Bilinmeyen mağaza",
        offers: [],
        error: "Mağaza aranırken bir sorun oluştu.",
      };
    });

  const offers = storeResults
    .flatMap((result) => result.offers)
    .sort((a, b) => {
      const totalA = a.price + a.shipping;
      const totalB = b.price + b.shipping;

      return totalA - totalB;
    });

  return {
    offers,
    storeResults,
  };
}