import { normalizeText } from "./normalize";

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((word) => word.length > 1);
}