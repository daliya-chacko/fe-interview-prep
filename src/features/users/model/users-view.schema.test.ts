import { describe, expect, it } from 'vitest';

import { parseUsersView, serializeUsersView, toSortState } from './users-view.schema';

describe('parseUsersView', () => {
  it('applies defaults when the URL carries no params', () => {
    expect(parseUsersView(new URLSearchParams())).toEqual({
      sort: undefined,
      dir: 'asc',
      q: '',
      gender: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('reads a complete view back from the URL', () => {
    const view = parseUsersView(
      new URLSearchParams('sort=age&dir=desc&q=lee&gender=female&page=3&pageSize=25'),
    );

    expect(view).toEqual({
      sort: 'age',
      dir: 'desc',
      q: 'lee',
      gender: 'female',
      page: 3,
      pageSize: 25,
    });
    expect(toSortState(view)).toEqual({ key: 'age', direction: 'desc' });
  });

  it('falls back field by field when a value is invalid', () => {
    const view = parseUsersView(
      new URLSearchParams('sort=salary&dir=up&gender=other&page=-2&pageSize=99&q=ok'),
    );

    expect(view).toEqual({
      sort: undefined,
      dir: 'asc',
      q: 'ok',
      gender: undefined,
      page: 1,
      pageSize: 10,
    });
    expect(toSortState(view)).toBeUndefined();
  });
});

describe('serializeUsersView', () => {
  it('leaves defaults out and round-trips the rest', () => {
    const view = parseUsersView(new URLSearchParams('sort=name&dir=desc&page=2'));

    expect(serializeUsersView(view)).toEqual({ sort: 'name', dir: 'desc', page: '2' });
    expect(parseUsersView(new URLSearchParams(serializeUsersView(view)))).toEqual(view);
  });

  it('writes nothing for the default view and no direction without a sort', () => {
    expect(serializeUsersView(parseUsersView(new URLSearchParams()))).toEqual({});
    expect(serializeUsersView(parseUsersView(new URLSearchParams('dir=desc')))).toEqual({});
  });
});
