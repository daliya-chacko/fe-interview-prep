import { useSearchParams } from 'react-router';

import type { UserGender } from '../model/user.schema';
import {
  parseUsersView,
  serializeUsersView,
  toSortState,
  type UsersSort,
  type UsersView,
} from '../model/users-view.schema';

/**
 * The table view, read from and written to the URL search params so a view can be shared as a
 * link. Every change pushes a new history entry, which is what makes Back and Forward step
 * between views. Anything that changes which rows match sends the user back to page 1.
 */
export function useUsersView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseUsersView(searchParams);

  function update(patch: Partial<UsersView>) {
    setSearchParams((current) => serializeUsersView({ ...parseUsersView(current), ...patch }));
  }

  return {
    view,
    sort: toSortState(view),
    setSort: (sort: UsersSort | undefined) => {
      update({ sort: sort?.key, dir: sort?.direction ?? 'asc', page: 1 });
    },
    setQuery: (q: string) => {
      update({ q, page: 1 });
    },
    setGender: (gender: UserGender | undefined) => {
      update({ gender, page: 1 });
    },
    setPage: (page: number) => {
      update({ page });
    },
    setPageSize: (pageSize: UsersView['pageSize']) => {
      update({ pageSize, page: 1 });
    },
  };
}
