import { normalizeText } from "./normalize";

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
  "pil",
  "adaptor",
  "sarj cihazi",
  "duvar askisi",
  "garanti",
  "sigorta",
  "koruma paketi",
  "bakim paketi",
  "temizlik seti",
  "yedek parca",
  "mop",
  "firca",
];

function getWords(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean);
}

function isAccessory(title: string): boolean {
  const normalizedTitle = normalizeText(title);

  return accessoryWords.some((word) =>
    normalizedTitle.includes(normalizeText(word)),
  );
}

export function isMatchingProduct(
  searchText: string,
  productTitle: string,
): boolean {
  if (!searchText.trim() || !productTitle.trim()) {
    return false;
  }

  if (isAccessory(productTitle)) {
    return false;
  }

  const searchWords = getWords(searchText);
  const titleWords = getWords(productTitle);

  const titleWordSet = new Set(titleWords);

  /*
    İçinde rakam bulunan kelimeleri model kodu kabul ediyoruz:
    V15, V15S, KGN56XLE0N, RTX5070 gibi.
  */
  const searchModelWords = searchWords.filter((word) =>
    /\d/.test(word),
  );

  /*
    Model kodu tam eşleşmeli:
    V15 = V15
    V15 != V15S
  */
  for (const model of searchModelWords) {
    if (!titleWordSet.has(model)) {
      return false;
    }
  }

  /*
    Model kodu dışındaki ilk kelimeyi marka kabul ediyoruz:
    Dyson V15 → dyson
    Bosch KGN56XLE0N → bosch
  */
  const brand = searchWords.find(
    (word) => !searchModelWords.includes(word),
  );

  if (brand && !titleWordSet.has(brand)) {
    return false;
  }

  return true;
}