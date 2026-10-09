import { useId } from 'react';

import { Button, inputClassName } from '@/shared/components/ui';

import type { PageInfo } from './types';

export type TablePaginationProps<Size extends number = number> = PageInfo & {
  pageSizeOptions: readonly Size[];
  onPageChange: (page: number) => void;
  /** Receives one of `pageSizeOptions`, so a literal union stays a literal union. */
  onPageSizeChange: (pageSize: Size) => void;
  /** Plural noun for the summary, e.g. "users" in "Showing 1-10 of 600 users". */
  itemsLabel?: string;
};

/**
 * Page-size choice, previous/next controls and a live summary of the visible range. The summary
 * is a status region so assistive technology hears the new range after every change.
 */
export function TablePagination<Size extends number = number>({
  page,
  pageCount,
  pageSize,
  from,
  to,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  itemsLabel = 'rows',
}: TablePaginationProps<Size>) {
  const pageSizeId = useId();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor={pageSizeId} className="font-medium">
          Rows per page
        </label>
        <select
          id={pageSizeId}
          value={pageSize}
          onChange={(event) => {
            const next = pageSizeOptions.find((option) => String(option) === event.target.value);
            if (next !== undefined) onPageSizeChange(next);
          }}
          className={inputClassName('h-9 w-auto pr-8')}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <p role="status" className="text-zinc-600 dark:text-zinc-400">
        {total === 0
          ? `No ${itemsLabel} to show`
          : `Showing ${from}–${to} of ${total} ${itemsLabel}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        <span className="tabular-nums">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
