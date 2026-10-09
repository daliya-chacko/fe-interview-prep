import type {
  ColumnDef,
  ColumnFilters,
  PageInfo,
  SortState,
  TableView,
  TableViewInput,
} from './types';

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/**
 * The sort that follows a click on `key`: a different column starts ascending, the same column
 * cycles ascending -> descending -> unsorted.
 */
export function nextSort<Key extends string>(
  current: SortState<Key> | undefined,
  key: Key,
): SortState<Key> | undefined {
  if (current?.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return undefined;
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/** Returns a sorted copy; equal values keep their order. Unsorted input is returned as-is. */
export function sortRows<Row, Key extends string>(
  rows: Row[],
  columns: ReadonlyArray<ColumnDef<Row, Key>>,
  sort: SortState<Key> | undefined,
): Row[] {
  if (!sort) return rows;
  const column = columns.find((candidate) => candidate.key === sort.key);
  if (!column) return rows;

  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => sign * compareValues(column.accessor(a), column.accessor(b)));
}

/** Keeps the rows whose searchable columns contain `query` (case-insensitive, trimmed). */
export function searchRows<Row, Key extends string>(
  rows: Row[],
  columns: ReadonlyArray<ColumnDef<Row, Key>>,
  query: string,
): Row[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return rows;

  const searchable = columns.filter((column) => column.searchable !== false);
  return rows.filter((row) =>
    searchable.some((column) => String(column.accessor(row)).toLowerCase().includes(needle)),
  );
}

/** Keeps the rows whose column value equals every non-empty filter (case-insensitive). */
export function filterRows<Row, Key extends string>(
  rows: Row[],
  columns: ReadonlyArray<ColumnDef<Row, Key>>,
  filters: ColumnFilters<Key>,
): Row[] {
  const active = columns.flatMap((column) => {
    const value = filters[column.key];
    return value ? [{ column, value: value.toLowerCase() }] : [];
  });
  if (active.length === 0) return rows;

  return rows.filter((row) =>
    active.every(({ column, value }) => String(column.accessor(row)).toLowerCase() === value),
  );
}

/** Slices one page out of `rows`, clamping `page` into the valid range. */
export function paginateRows<Row>(
  rows: Row[],
  page: number,
  pageSize: number,
): PageInfo & { rows: Row[] } {
  const size = Math.max(1, Math.floor(pageSize));
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount);
  const start = (current - 1) * size;
  const pageRows = rows.slice(start, start + size);

  return {
    rows: pageRows,
    page: current,
    pageCount,
    pageSize: size,
    from: total === 0 ? 0 : start + 1,
    to: start + pageRows.length,
    total,
  };
}

/** Search, filter, sort and paginate in one step: the whole client-side table pipeline. */
export function computeTableView<Row, Key extends string>(
  rows: Row[],
  columns: ReadonlyArray<ColumnDef<Row, Key>>,
  { sort, query = '', filters = {}, page, pageSize }: TableViewInput<Key>,
): TableView<Row> {
  const matched = filterRows(searchRows(rows, columns, query), columns, filters);
  return paginateRows(sortRows(matched, columns, sort), page, pageSize);
}
