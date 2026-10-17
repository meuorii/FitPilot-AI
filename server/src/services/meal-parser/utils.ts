export const round1 = (value: number): number => Math.round(value * 10) / 10;

export const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export const normalizeText = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull the first number out of a string.
 * "367 kcal" -> 367, "7.2g" -> 7.2, "0.5 g" -> 0.5, "1,200" -> 1200, "7,2g" -> 7.2
 */
export const parseNumber = (raw: string | undefined | null): number | null => {
  if (!raw) return null;

  const match = raw.match(/\d[\d,]*(?:\.\d+)?|\.\d+/);
  if (!match) return null;

  let token = match[0];
  token = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(token)
    ? token.replace(/,/g, '')
    : token.replace(',', '.');

  const value = Number(token);
  return Number.isFinite(value) ? value : null;
};

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current: number[] = [i];

    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      current[j] = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
    }

    previous = current;
  }

  return previous[b.length] ?? 0;
};

/** 0..1, where 1 is identical. */
export const similarity = (a: string, b: string): number => {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
};
