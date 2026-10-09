import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { computeTableView, DataTable, TablePagination } from '@/shared/components/data-table';
import { Button, Spinner } from '@/shared/components/ui';

import { usersListQuery } from '../api/users.queries';
import { useUsersView } from '../hooks/useUsersView';
import { USERS_PAGE_SIZES } from '../model/users-view.schema';
import { usersColumns } from './users-columns';
import { UsersToolbar } from './UsersToolbar';

/**
 * The users dataset in a `DataTable`: one query for the whole list, with every sort, search,
 * filter and page decision read from the URL and applied on the client.
 */
export function UsersTable() {
  const result = useQuery(usersListQuery());
  const { view, sort, setSort, setQuery, setGender, setPage, setPageSize } = useUsersView();

  const users = result.data?.users;
  const tableView = useMemo(
    () =>
      computeTableView(users ?? [], usersColumns, {
        sort,
        query: view.q,
        filters: { gender: view.gender },
        page: view.page,
        pageSize: view.pageSize,
      }),
    [users, sort, view.q, view.gender, view.page, view.pageSize],
  );

  if (result.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Spinner size="sm" label="Loading users" />
        <span aria-hidden="true">Loading users…</span>
      </div>
    );
  }

  if (result.isError) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <span>Something went wrong while loading users. Please try again.</span>
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

  const isFiltered = view.q !== '' || view.gender !== undefined;

  return (
    <div className="space-y-4">
      <UsersToolbar
        query={view.q}
        gender={view.gender}
        onQueryChange={setQuery}
        onGenderChange={setGender}
      />
      <DataTable
        columns={usersColumns}
        rows={tableView.rows}
        rowKey={(user) => user.id}
        caption="Users"
        sort={sort}
        onSortChange={setSort}
        emptyMessage={
          isFiltered ? 'No users match the current search and filter.' : 'No users to show.'
        }
      />
      <TablePagination
        page={tableView.page}
        pageCount={tableView.pageCount}
        pageSize={tableView.pageSize}
        from={tableView.from}
        to={tableView.to}
        total={tableView.total}
        pageSizeOptions={USERS_PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemsLabel="users"
      />
    </div>
  );
}
