import { StoreSearchResult } from "./types";

export async function searchAmazon(
  query: string,
): Promise<StoreSearchResult> {
  console.log("Amazon araması:", query);

  return {
    store: "Amazon",
    offers: [],
  };
}