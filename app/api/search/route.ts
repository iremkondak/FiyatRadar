import { NextRequest, NextResponse } from "next/server";
import { searchAllStores } from "../../services/stores";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      {
        message: "Lütfen bir ürün adı veya model kodu girin.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await searchAllStores(query);

    return NextResponse.json({
      searchedProduct: query,
      resultCount: result.offers.length,
      offers: result.offers,
      stores: result.storeResults,
    });
  } catch (error) {
    console.error("Mağaza arama hatası:", error);

    return NextResponse.json(
      {
        message: "Mağazalar aranırken bir sorun oluştu.",
      },
      {
        status: 500,
      },
    );
  }
}