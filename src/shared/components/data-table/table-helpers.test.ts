import { describe, expect, it } from 'vitest';

import {
  computeTableView,
  filterRows,
  nextSort,
  paginateRows,
  searchRows,
  sortRows,
} from './table-helpers';
import type { ColumnDef } from './types';

type Person = { id: number; name: string; age: number; team: string };

const people: Person[] = [
  { id: 1, name: 'Zoe', age: 30, team: 'red' },
  { id: 2, name: 'adam', age: 25, team: 'blue' },
  { id: 3, name: 'Mia', age: 30, team: 'red' },
  { id: 4, name: 'Bob', age: 41, team: 'blue' },
];

const columns: Array<ColumnDef<Person, 'name' | 'age' | 'team'>> = [
  { key: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
  { key: 'age', header: 'Age', accessor: (row) => row.age, sortable: true },
  { key: 'team', header: 'Team', accessor: (row) => row.team, searchable: false },
];

const ids = (rows: Person[]) => rows.map((row) => row.id);

describe('nextSort', () => {
  it('cycles a column through ascending, descending and none', () => {
    const asc = nextSort(undefined, 'age');
    expect(asc).toEqual({ key: 'age', direction: 'asc' });
    const desc = nextSort(asc, 'age');
    expect(desc).toEqual({ key: 'age', direction: 'desc' });
    expect(nextSort(desc, 'age')).toBeUndefined();
  });

  it('starts a different column ascending regardless of the current direction', () => {
    expect(nextSort({ key: 'age', direction: 'desc' }, 'name')).toEqual({
      key: 'name',
      direction: 'asc',
    });
  });
});

describe('sortRows', () => {
  it('returns the input untouched when there is no sort', () => {
    expect(sortRows(people, columns, undefined)).toBe(people);
  });

  it('sorts strings case-insensitively and numbers numerically', () => {
    expect(ids(sortRows(people, columns, { key: 'name', direction: 'asc' }))).toEqual([2, 4, 3, 1]);
    expect(ids(sortRows(people, columns, { key: 'age', direction: 'desc' }))).toEqual([4, 1, 3, 2]);
  });

  it('is stable for equal values and does not mutate the input', () => {
    const copy = [...people];
    expect(ids(sortRows(people, columns, { key: 'age', direction: 'asc' }))).toEqual([2, 1, 3, 4]);
    expect(people).toEqual(copy);
  });

  it('ignores a sort key that matches no column', () => {
    const withoutAge = columns.filter((column) => column.key !== 'age');
    expect(sortRows(people, withoutAge, { key: 'age', direction: 'asc' })).toBe(people);
  });
});

describe('searchRows', () => {
  it('matches any searchable column, ignoring case and surrounding whitespace', () => {
    expect(ids(searchRows(people, columns, '  ZO '))).toEqual([1]);
    expect(ids(searchRows(people, columns, '30'))).toEqual([1, 3]);
  });

  it('skips columns marked as not searchable', () => {
    expect(searchRows(people, columns, 'red')).toEqual([]);
  });

  it('returns every row for an empty query', () => {
    expect(searchRows(people, columns, '   ')).toBe(people);
  });
});

describe('filterRows', () => {
  it('keeps rows equal to every active filter and ignores empty ones', () => {
    expect(ids(filterRows(people, columns, { team: 'Blue', name: '' }))).toEqual([2, 4]);
    expect(filterRows(people, columns, {})).toBe(people);
  });
});

describe('paginateRows', () => {
  it('slices the requested page and reports the range', () => {
    expect(paginateRows(people, 2, 3)).toEqual({
      rows: [people[3]],
      page: 2,
      pageCount: 2,
      pageSize: 3,
      from: 4,
      to: 4,
      total: 4,
    });
  });

  it('clamps out-of-range pages', () => {
    expect(paginateRows(people, 9, 3).page).toBe(2);
    expect(paginateRows(people, 0, 3).page).toBe(1);
  });

  it('reports an empty range when there are no rows', () => {
    expect(paginateRows([], 1, 10)).toEqual({
      rows: [],
      page: 1,
      pageCount: 1,
      pageSize: 10,
      from: 0,
      to: 0,
      total: 0,
    });
  });
});

describe('computeTableView', () => {
  it('searches, filters, sorts and paginates in that order', () => {
    const view = computeTableView(people, columns, {
      filters: { team: 'red' },
      sort: { key: 'name', direction: 'desc' },
      page: 1,
      pageSize: 1,
    });
    expect(ids(view.rows)).toEqual([1]);
    expect(view).toMatchObject({ page: 1, pageCount: 2, from: 1, to: 1, total: 2 });
  });
});
