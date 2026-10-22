/**
 * Text and word counting utilities for product descriptions and rich text.
 */

/**
 * Counts words in a string by stripping HTML tags and entities,
 * and collapsing whitespace.
 */
export const countWords = (text?: string | null): number => {
  if (!text) return 0;
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
};
