function normalizeText(value: string): string {
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
  
  const accessoryWords = [
    "uyumlu",
    "aksesuar",
    "yedek",
    "filtre",
    "boru",
    "baslik",
    "aparat",
    "stand",
    "batarya",
    "adaptor",
    "garanti",
    "koruma paketi",
  ];
  
  function matchesQuery(title: string, query: string): boolean {
    const titleWords = normalizeText(title).split(" ");
    const queryWords = normalizeText(query).split(" ");
  
    const brand = queryWords.find((word) => !/\d/.test(word));
  
    if (brand && !titleWords.includes(brand)) {
      return false;
    }
  
    const modelWords = queryWords.filter((word) => /\d/.test(word));
  
    for (const model of modelWords) {
      if (!titleWords.includes(model)) {
        return false;
      }
    }
  
    return true;
  }
  
  export function isValidMediaMarktProduct(
    title: string,
    query: string,
    price: number,
  ): boolean {
    if (!title.trim() || price <= 0) {
      return false;
    }
  
    const normalizedTitle = normalizeText(title);
  
    if (
      accessoryWords.some((word) =>
        normalizedTitle.includes(normalizeText(word)),
      )
    ) {
      return false;
    }
  
    return matchesQuery(title, query);
  }