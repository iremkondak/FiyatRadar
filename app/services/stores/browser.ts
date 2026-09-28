import { chromium } from "playwright";

export async function openBrowser() {
  const browser = await chromium.launch({
    headless: true,
  });

  return browser;
}