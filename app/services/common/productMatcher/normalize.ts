export function normalizeText(value: string): string {
    return value
      .toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i")
      .replaceAll("ş", "s")
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[™®]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }