import type { ColumnDef } from '@/shared/components/data-table';

import type { User } from '../model/user.schema';
import type { UsersSortKey } from '../model/users-view.schema';

/** The users table, described rather than hard-coded: keys double as the URL's sort values. */
export const usersColumns: ReadonlyArray<ColumnDef<User, UsersSortKey>> = [
  {
    key: 'name',
    header: 'Name',
    accessor: (user) => `${user.firstName} ${user.lastName}`,
    sortable: true,
  },
  { key: 'age', header: 'Age', accessor: (user) => user.age, sortable: true, align: 'right' },
  { key: 'gender', header: 'Gender', accessor: (user) => user.gender, sortable: true },
  { key: 'email', header: 'Email', accessor: (user) => user.email, sortable: true },
  { key: 'city', header: 'City', accessor: (user) => user.address.city, sortable: true },
  { key: 'company', header: 'Company', accessor: (user) => user.company.name, sortable: true },
];
