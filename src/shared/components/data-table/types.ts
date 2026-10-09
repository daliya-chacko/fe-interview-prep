import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

/** The active sort: which column and in which direction. `undefined` means unsorted. */
export type SortState<Key extends string = string> = {
  key: Key;
  direction: SortDirection;
};

/** A primitive the table can render, compare and search without help. */
export type CellValue = string | number;

/**
 * Describes one column of a `DataTable`. The table is driven entirely by an array of these, so the
 * same component renders any dataset: `accessor` is the single source for rendering, sorting and
 * searching, and `cell` overrides only how the value is displayed.
 */
export type ColumnDef<Row, Key extends string = string> = {
  /** Stable identifier, also the value stored in the URL when the column is sorted. */
  key: Key;
  /** Visible column heading. */
  header: string;
  /** Returns the value shown, sorted and searched for this column. */
  accessor: (row: Row) => CellValue;
  /** Custom rendering of a cell; defaults to the accessor's value. */
  cell?: (row: Row) => ReactNode;
  /** Whether clicking the header cycles the sort for this column. Defaults to `false`. */
  sortable?: boolean;
  /** Whether the global search looks at this column. Defaults to `true`. */
  searchable?: boolean;
  /** Horizontal alignment of the heading and cells. Defaults to `'left'`. */
  align?: 'left' | 'right';
};

/** Equality filters keyed by column, e.g. `{ gender: 'female' }`. Empty strings are ignored. */
export type ColumnFilters<Key extends string = string> = Partial<Record<Key, string>>;

export type TableViewInput<Key extends string = string> = {
  sort?: SortState<Key>;
  /** Case-insensitive text matched against every searchable column. */
  query?: string;
  filters?: ColumnFilters<Key>;
  /** 1-based page number; out-of-range values are clamped. */
  page: number;
  pageSize: number;
};

export type PageInfo = {
  /** The page actually shown after clamping. */
  page: number;
  pageCount: number;
  pageSize: number;
  /** 1-based position of the first row on this page; 0 when there are no rows. */
  from: number;
  /** 1-based position of the last row on this page; 0 when there are no rows. */
  to: number;
  /** Rows left after search and filters, across all pages. */
  total: number;
};

export type TableView<Row> = PageInfo & {
  rows: Row[];
};
