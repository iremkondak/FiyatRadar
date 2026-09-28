import { tokenize } from "./tokenizer";

export function extractModelCodes(text: string): string[] {
  return tokenize(text).filter((word) => {
    // V15, V15s, KGN56XLE0N, RTX5070 gibi model kodlarını yakalar.
    return /^(?=.*[a-z])(?=.*\d)[a-z0-9]+$/i.test(word);
  });
}

export function hasSameModel(
  searchText: string,
  productTitle: string,
): boolean {
  const searchModels = extractModelCodes(searchText);

  // Kullanıcı yalnızca "Dyson" yazdıysa model zorunluluğu yok.
  if (searchModels.length === 0) {
    return true;
  }

  const productModels = extractModelCodes(productTitle);

  /*
    Tam eşleşme gerekir:
    V15 = V15
    V15 ≠ V15s
    V15 ≠ V12
  */
  return searchModels.every((searchModel) =>
    productModels.some(
      (productModel) => productModel === searchModel,
    ),
  );
}