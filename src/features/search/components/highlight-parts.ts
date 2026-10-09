export type HighlightPart = {
  text: string;
  matched: boolean;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits `text` into the parts that match `query` (case-insensitively) and the parts that do not,
 * preserving the original casing and order. An empty query yields the whole text unmatched.
 */
export function splitByMatch(text: string, query: string): HighlightPart[] {
  const term = query.trim();
  if (text === '' || term === '') return [{ text, matched: false }];

  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, matched: part.toLowerCase() === term.toLowerCase() }));
}
