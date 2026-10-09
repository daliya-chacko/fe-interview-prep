import { Fragment } from 'react';

import { splitByMatch } from './highlight-parts';

export type HighlightProps = {
  text: string;
  query: string;
};

/**
 * Renders `text` with every occurrence of `query` wrapped in `<mark>`, as plain React nodes.
 * Unmatched parts stay bare text nodes so the surrounding whitespace survives accessible-name
 * computation ("React Handbook", not "ReactHandbook").
 */
export function Highlight({ text, query }: HighlightProps) {
  const parts = splitByMatch(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.matched ? (
          <mark
            key={`${index}-${part.text}`}
            className="rounded-sm bg-amber-200 px-0.5 text-inherit dark:bg-amber-500/40"
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={`${index}-${part.text}`}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
