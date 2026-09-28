import { NextResponse } from "next/server";
import { openBrowser } from "../../services/stores/browser";

export const runtime = "nodejs";

export async function GET() {
  const browser = await openBrowser();

  try {
    const page = await browser.newPage();

    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    const title = await page.title();
    const heading = await page.locator("h1").first().textContent();

    return NextResponse.json({
      success: true,
      title,
      heading,
    });
  } catch (error) {
    console.error("Playwright test hatası:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Playwright sayfayı açamadı.",
      },
      {
        status: 500,
      },
    );
  } finally {
    await browser.close();
  }
}