import type { Page } from "playwright";

type JsonObject = Record<string, unknown>;

export type ProductPageData = {
  title: string;
  price: number;
  currency: string;
  inStock: boolean;
  imageUrl: string;
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getFirstObject(value: unknown): JsonObject | null {
  if (isObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find(isObject) ?? null;
  }

  return null;
}

function isProductType(value: unknown): boolean {
  if (typeof value === "string") {
    return value.toLowerCase() === "product";
  }

  if (Array.isArray(value)) {
    return value.some(
      (item) =>
        typeof item === "string" &&
        item.toLowerCase() === "product",
    );
  }

  return false;
}

function findProductNode(value: unknown): JsonObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findProductNode(item);

      if (result) {
        return result;
      }
    }

    return null;
  }

  if (!isObject(value)) {
    return null;
  }

  if (isProductType(value["@type"])) {
    return value;
  }

  for (const child of Object.values(value)) {
    const result = findProductNode(child);

    if (result) {
      return result;
    }
  }

  return null;
}

function parsePrice(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value
    .replace(/\s/g, "")
    .replace(/[^\d.,]/g, "");

  if (!cleaned) {
    return 0;
  }

  const commaIndex = cleaned.lastIndexOf(",");
  const dotIndex = cleaned.lastIndexOf(".");

  let normalized = cleaned;

  if (commaIndex > dotIndex) {
    normalized = cleaned
      .replace(/\./g, "")
      .replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const price = Number(normalized);

  return Number.isFinite(price) ? price : 0;
}

function getImageUrl(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const firstString = value.find(
      (item) => typeof item === "string",
    );

    if (typeof firstString === "string") {
      return firstString;
    }

    const firstObject = value.find(isObject);

    if (firstObject) {
      return getText(firstObject.url);
    }
  }

  if (isObject(value)) {
    return getText(value.url);
  }

  return "";
}

function getStockStatus(value: unknown): boolean {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.toLowerCase();

  return !(
    normalized.includes("outofstock") ||
    normalized.includes("out_of_stock") ||
    normalized.includes("soldout")
  );
}

export async function readJsonLdProduct(
    page: Page,
  ): Promise<ProductPageData | null> {
    await page.waitForLoadState("domcontentloaded");
  
    await page
      .locator('script[type="application/ld+json"]')
      .first()
      .waitFor({
        state: "attached",
        timeout: 5000,
      })
      .catch(() => null);
  
    const jsonLdTexts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
let productNode: Record<string, unknown> | null=null;
  for (const jsonText of jsonLdTexts) {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      productNode = findProductNode(parsed);

      if (productNode) {
        break;
      }
    } catch {
      // Bozuk JSON-LD varsa diğer script denenir.
    }
  }

  if (!productNode) {
    return null;
  }

  const offer = getFirstObject(productNode.offers);

  if (!offer) {
    return null;
  }

  const title =
    getText(productNode.name) ||
    getText(productNode.headline);

  const price =
    parsePrice(offer.price) ||
    parsePrice(offer.lowPrice) ||
    parsePrice(offer.highPrice);

  if (!title || price <= 0) {
    return null;
  }

  return {
    title,
    price,
    currency: getText(offer.priceCurrency) || "TRY",
    inStock: getStockStatus(offer.availability),
    imageUrl: getImageUrl(productNode.image),
  };
}