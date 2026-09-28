import type { Page } from "playwright";
import { openBrowser } from "../browser";
import type {
  StoreOffer,
  StoreSearchResult,
} from "../types";
import { readJsonLdProduct } from "../../common/jsonld";
import { isValidMediaMarktProduct } from "./filter";

async function readProductPage(
  page: Page,
  productUrl: string,
  query: string,
  index: number,
): Promise<StoreOffer | null> {
  await page.goto(productUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await page.waitForTimeout(1000);

  const product = await readJsonLdProduct(page);

  if (!product) {
    return null;
  }

  if (
    !isValidMediaMarktProduct(
      product.title,
      query,
      product.price,
    )
  ) {
    return null;
  }

  return {
    id: `mediamarkt-${index}-${product.price}`,
    title: product.title,
    store: "MediaMarkt",
    price: product.price,
    shipping: 0,
    shippingText: "Kargo bilgisi mağazada",
    inStock: product.inStock,
    productUrl,
    imageUrl: product.imageUrl,
    rating: null,
    reviews: null,
  };
}

export async function searchMediaMarkt(
  query: string,
): Promise<StoreSearchResult> {
  const browser = await openBrowser();

  try {
    const context = await browser.newContext({
      locale: "tr-TR",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/149 Safari/537.36",
    });

    const searchPage = await context.newPage();

    await searchPage.goto("https://www.mediamarkt.com.tr", {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });

    await searchPage.waitForTimeout(4000);

    const searchInput = searchPage
      .locator(
        [
          'input[type="search"]',
          'input[placeholder*="Ara"]',
          'input[placeholder*="ara"]',
          'input[aria-label*="Ara"]',
          'input[aria-label*="ara"]',
          'input[name="query"]',
          'input[name="q"]',
          'input[name="search"]',
        ].join(","),
      )
      .first();

    const searchInputFound = await searchInput
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!searchInputFound) {
      return {
        store: "MediaMarkt",
        offers: [],
        error: "MediaMarkt arama kutusu bulunamadı.",
      };
    }

    await searchInput.fill(query);
    await searchInput.press("Enter");

    await searchPage.waitForLoadState("domcontentloaded", {
      timeout: 30000,
    });

    await searchPage.waitForTimeout(5000);

    const rawLinks = await searchPage
      .locator(
        [
          'a[href*="/product/"]',
          'a[href*="/tr/product/"]',
          'a[href$=".html"]',
        ].join(","),
      )
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute("href"))
          .filter(
            (href): href is string =>
              typeof href === "string" &&
              href.length > 0 &&
              href.includes("product"),
          ),
      );

    const productUrls = Array.from(
      new Set(
        rawLinks.map((href) => {
          if (href.startsWith("http")) {
            return href;
          }

          return new URL(
            href,
            "https://www.mediamarkt.com.tr",
          ).toString();
        }),
      ),
    ).slice(0, 12);

    if (productUrls.length === 0) {
      return {
        store: "MediaMarkt",
        offers: [],
        error: `MediaMarkt arama sayfası açıldı ancak ürün bağlantısı bulunamadı. Açılan adres: ${searchPage.url()}`,
      };
    }

    const offers: StoreOffer[] = [];
    const productPage = await context.newPage();

    for (
      let index = 0;
      index < productUrls.length;
      index++
    ) {
      try {
        const offer = await readProductPage(
          productPage,
          productUrls[index],
          query,
          index,
        );

        if (offer) {
          offers.push(offer);
        }
      } catch (error) {
        console.error(
          "MediaMarkt ürün sayfası okunamadı:",
          productUrls[index],
          error,
        );
      }
    }

    return {
        store: "MediaMarkt",
        offers,
        error:
          offers.length === 0
            ? `MediaMarkt'ta ${productUrls.length} ürün bağlantısı bulundu ancak bunların hiçbiri tam olarak "${query}" modeliyle eşleşmedi.`
            : undefined,
      };
  } catch (error) {
    console.error("MediaMarkt arama hatası:", error);

    return {
      store: "MediaMarkt",
      offers: [],
      error:
        error instanceof Error
          ? error.message
          : "MediaMarkt sonuçları alınamadı.",
    };
  } finally {
    await browser.close();
  }
}