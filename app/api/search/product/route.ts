import { NextRequest, NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
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

function findProduct(value: unknown): JsonObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const product = findProduct(item);

      if (product) {
        return product;
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
    const product = findProduct(child);

    if (product) {
      return product;
    }
  }

  return null;
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

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getImage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const image = value.find((item) => typeof item === "string");

    if (typeof image === "string") {
      return image;
    }
  }

  if (isObject(value)) {
    return getText(value.url);
  }

  return "";
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
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const price = Number(normalized);

  return Number.isFinite(price) ? price : 0;
}

function parseStock(value: unknown): boolean | null {
  if (typeof value !== "string") {
    return null;
  }

  const stockText = value.toLowerCase();

  if (
    stockText.includes("instock") ||
    stockText.includes("in_stock")
  ) {
    return true;
  }

  if (
    stockText.includes("outofstock") ||
    stockText.includes("out_of_stock") ||
    stockText.includes("soldout")
  ) {
    return false;
  }

  return null;
}

function extractJsonLd(html: string): unknown[] {
  const expression =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const results: unknown[] = [];

  for (const match of html.matchAll(expression)) {
    const content = match[1]?.trim();

    if (!content) {
      continue;
    }

    try {
      results.push(JSON.parse(content));
    } catch {
      // Geçersiz JSON-LD varsa diğer scriptlere devam et.
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const urlText = request.nextUrl.searchParams.get("url")?.trim();

  if (!urlText) {
    return NextResponse.json(
      { message: "Lütfen bir ürün bağlantısı girin." },
      { status: 400 },
    );
  }

  let productUrl: URL;

  try {
    productUrl = new URL(urlText);
  } catch {
    return NextResponse.json(
      { message: "Geçerli bir ürün bağlantısı girin." },
      { status: 400 },
    );
  }

  if (!["http:", "https:"].includes(productUrl.protocol)) {
    return NextResponse.json(
      { message: "Yalnızca HTTP veya HTTPS bağlantıları kullanılabilir." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(productUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/149 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message: `Ürün sayfası okunamadı. HTTP kodu: ${response.status}`,
        },
        { status: 502 },
      );
    }

    const html = await response.text();
    const jsonLdItems = extractJsonLd(html);

    let product: JsonObject | null = null;

    for (const item of jsonLdItems) {
      product = findProduct(item);

      if (product) {
        break;
      }
    }

    if (!product) {
      return NextResponse.json(
        {
          message:
            "Bu sayfada okunabilir yapılandırılmış ürün bilgisi bulunamadı.",
        },
        { status: 422 },
      );
    }

    const offer = getFirstObject(product.offers);

    if (!offer) {
      return NextResponse.json(
        { message: "Ürün bulundu fakat fiyat teklifi bulunamadı." },
        { status: 422 },
      );
    }

    const seller = getFirstObject(offer.seller);

    const price =
      parsePrice(offer.price) ||
      parsePrice(offer.lowPrice) ||
      parsePrice(offer.highPrice);

    if (price <= 0) {
      return NextResponse.json(
        { message: "Ürünün fiyatı okunamadı." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      title: getText(product.name) || "Ürün",
      price,
      currency: getText(offer.priceCurrency) || "TRY",
      inStock: parseStock(offer.availability),
      imageUrl: getImage(product.image),
      store:
        getText(seller?.name) ||
        productUrl.hostname.replace(/^www\./, ""),
      productUrl: productUrl.toString(),
    });
  } catch (error) {
    console.error("Ürün okuma hatası:", error);

    return NextResponse.json(
      {
        message:
          "Ürün sayfası okunamadı. Mağaza otomatik erişimi engelliyor olabilir.",
      },
      { status: 500 },
    );
  }
}