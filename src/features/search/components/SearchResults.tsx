import type { UseQueryResult } from '@tanstack/react-query';

import { Button, Spinner } from '@/shared/components/ui';

import type { ProductSearchResponse } from '../model/product.schema';
import { Highlight } from './Highlight';

export type SearchResultsProps = {
  /** The debounced term the results belong to; empty means nothing has been searched yet. */
  query: string;
  result: UseQueryResult<ProductSearchResponse>;
};

export function SearchResults({ query, result }: SearchResultsProps) {
  if (query === '') {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Start typing to search the product catalogue.
      </p>
    );
  }

  if (result.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Spinner size="sm" label={`Searching for ${query}`} />
        <span aria-hidden="true">Searching…</span>
      </div>
    );
  }

  if (result.isError) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <span>Something went wrong while searching. Please try again.</span>
        <Button
          variant="secondary"
          size="sm"
          isLoading={result.isFetching}
          onClick={() => {
            void result.refetch();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const { products } = result.data;

  if (products.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No results for '{query}'</p>;
  }

  return (
    <ul aria-label="Search results" className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {products.map((product) => (
        <li key={product.id} className="space-y-1 py-3">
          <h2 className="font-medium">
            <Highlight text={product.title} query={query} />
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <Highlight text={product.description} query={query} />
          </p>
          <p className="text-xs text-zinc-500">
            {product.category} · ${product.price}
          </p>
        </li>
      ))}
    </ul>
  );
}
