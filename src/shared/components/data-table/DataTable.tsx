import { cn } from '@/shared/lib/cn';

import { nextSort } from './table-helpers';
import type { ColumnDef, SortState } from './types';

export type DataTableProps<Row, Key extends string> = {
  columns: ReadonlyArray<ColumnDef<Row, Key>>;
  /** The rows to render, already filtered, sorted and paged by the caller. */
  rows: Row[];
  /** Stable identity for each row, used as the React key. */
  rowKey: (row: Row) => string | number;
  /** Accessible name of the table; rendered as a visually hidden `<caption>`. */
  caption: string;
  sort?: SortState<Key>;
  /** Called with the next sort when a sortable header is activated. */
  onSortChange?: (sort: SortState<Key> | undefined) => void;
  /** Shown in place of the body when `rows` is empty. */
  emptyMessage?: string;
};

const ariaSortValue = {
  asc: 'ascending',
  desc: 'descending',
} as const;

const sortIndicator = {
  asc: '▲',
  desc: '▼',
} as const;

/**
 * A plain `<table>` driven by a column description. Sorting is announced through `aria-sort` on
 * the header cell and triggered by a real button, so it works with a keyboard and a screen reader.
 * The table owns no state: the caller decides what the rows and the sort are.
 */
export function DataTable<Row, Key extends string>({
  columns,
  rows,
  rowKey,
  caption,
  sort,
  onSortChange,
  emptyMessage = 'No rows to show.',
}: DataTableProps<Row, Key>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-600 uppercase dark:bg-zinc-800/60 dark:text-zinc-400">
          <tr>
            {columns.map((column) => {
              const direction = sort?.key === column.key ? sort.direction : undefined;
              const alignment = column.align === 'right' ? 'text-right' : 'text-left';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    column.sortable ? (direction ? ariaSortValue[direction] : 'none') : undefined
                  }
                  className={cn('px-3 py-2 font-medium whitespace-nowrap', alignment)}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange?.(nextSort(sort, column.key));
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm hover:text-zinc-900 dark:hover:text-zinc-100',
                        direction && 'text-zinc-900 dark:text-zinc-100',
                      )}
                    >
                      {column.header}
                      <span aria-hidden="true" className="w-3 text-[0.65rem]">
                        {direction ? sortIndicator[direction] : '⇅'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-zinc-600 dark:text-zinc-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 py-2 whitespace-nowrap',
                      column.align === 'right' ? 'text-right tabular-nums' : 'text-left',
                    )}
                  >
                    {column.cell ? column.cell(row) : column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
