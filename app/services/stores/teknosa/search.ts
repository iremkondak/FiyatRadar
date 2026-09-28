import type { Page } from "playwright";
import { openBrowser } from "../browser";
import type {
  StoreOffer,
  StoreSearchResult,
} from "../types";
import { readJsonLdProduct } from "../../common/jsonld";

async function readProductPage(
  page: Page,
  productUrl: string,
  index: number,
): Promise<StoreOffer | null> {
  await page.goto(productUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  const product = await readJsonLdProduct(page);

  if (!product) {
    return null;
  }

  return {
    id: `teknosa-${index}-${product.price}`,
    title: product.title,
    store: "Teknosa",
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

export async function searchTeknosa(
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

    const searchUrl = `https://www.teknosa.com/arama/?s=${encodeURIComponent(
      query.trim().replace(/\s+/g, "-"),
    )}`;

    await searchPage.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });

    await searchPage.waitForTimeout(4000);

    const rawLinks = await searchPage
      .locator('a[href*="-p-"]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute("href"))
          .filter(
            (href): href is string =>
              typeof href === "string" && href.length > 0,
          ),
      );

    const productUrls = Array.from(
      new Set(
        rawLinks.map((href) =>
          href.startsWith("http")
            ? href
            : `https://www.teknosa.com${href}`,
        ),
      ),
    ).slice(0, 12);

    const offers: StoreOffer[] = [];
    const debugResults: string[] = [];

    for (let index = 0; index < productUrls.length; index++) {
      const productUrl = productUrls[index];
      const productPage = await context.newPage();

      try {
        const offer = await readProductPage(
          productPage,
          productUrl,
          index,
        );

        if (offer) {
          offers.push(offer);
          debugResults.push(`OK: ${productUrl}`);
        } else {
          debugResults.push(
            `ÜRÜN VERİSİ YOK: ${productUrl}`,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Bilinmeyen hata";

        debugResults.push(
          `HATA: ${productUrl} — ${errorMessage}`,
        );

        console.error(
          "Teknosa ürün sayfası okunamadı:",
          productUrl,
          error,
        );
      } finally {
        await productPage.close();
      }
    }

    return {
      store: "Teknosa",
      offers,
      error:
        offers.length === 0
          ? JSON.stringify({
              message: "Teknosa ürün verileri okunamadı.",
              productUrlCount: productUrls.length,
              productUrls,
              debugResults,
            })
          : undefined,
    };
  } catch (error) {
    console.error("Teknosa arama hatası:", error);

    return {
      store: "Teknosa",
      offers: [],
      error:
        error instanceof Error
          ? error.message
          : "Teknosa sonuçları alınamadı.",
    };
  } finally {
    await browser.close();
  }
}