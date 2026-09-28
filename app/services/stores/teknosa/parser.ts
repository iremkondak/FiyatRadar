export function parseTurkishPrice(text: string): number {
    const ignoredWords = [
      "ayda",
      "aylık",
      "aylik",
      "taksit",
      "kazanç",
      "kazanc",
      "kupon",
      "puan",
      "kredi",
      "ödemesi",
      "odemesi",
    ];
  
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  
    const prices: number[] = [];
  
    for (const line of lines) {
      const lower = line.toLocaleLowerCase("tr-TR");
  
      if (
        ignoredWords.some((word) =>
          lower.includes(word.toLocaleLowerCase("tr-TR")),
        )
      ) {
        continue;
      }
  
      const match = line.match(
        /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(TL|₺)/i,
      );
  
      if (!match) continue;
  
      const value = Number(
        match[1]
          .replace(/\./g, "")
          .replace(",", "."),
      );
  
      if (Number.isFinite(value)) {
        prices.push(value);
      }
    }
  
    if (prices.length === 0) {
      return 0;
    }
  
    return Math.min(...prices);
  }