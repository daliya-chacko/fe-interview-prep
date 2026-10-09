export function errorIdOf(id: string): string {
  return `${id}-error`;
}

export function hintIdOf(id: string): string {
  return `${id}-hint`;
}

/** Joins the ids a control is described by (its hint and its error), or `undefined` for none. */
export function describedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const ids = [hasHint ? hintIdOf(id) : null, hasError ? errorIdOf(id) : null].filter(
    (value) => value !== null,
  );
  return ids.length > 0 ? ids.join(' ') : undefined;
}
