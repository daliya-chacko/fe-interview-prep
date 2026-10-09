import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from './DataTable';
import { TablePagination } from './TablePagination';
import type { ColumnDef } from './types';

type Fruit = { id: number; name: string; stock: number };

const fruits: Fruit[] = [
  { id: 1, name: 'Apple', stock: 4 },
  { id: 2, name: 'Pear', stock: 0 },
];

const columns: Array<ColumnDef<Fruit, 'name' | 'stock'>> = [
  { key: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
  {
    key: 'stock',
    header: 'Stock',
    accessor: (row) => row.stock,
    cell: (row) => (row.stock === 0 ? <em>sold out</em> : row.stock),
    align: 'right',
  },
];

describe('DataTable', () => {
  it('renders a captioned table from the column description', () => {
    render(<DataTable columns={columns} rows={fruits} rowKey={(row) => row.id} caption="Fruit" />);

    const table = screen.getByRole('table', { name: 'Fruit' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
    expect(within(table).getByRole('cell', { name: 'Apple' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'sold out' })).toBeInTheDocument();
  });

  it('exposes the sort through aria-sort and cycles it from the keyboard', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={fruits}
        rowKey={(row) => row.id}
        caption="Fruit"
        sort={{ key: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('columnheader', { name: 'Stock' })).not.toHaveAttribute('aria-sort');

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });

  it('shows the empty message when there are no rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        caption="Fruit"
        emptyMessage="Nothing here"
      />,
    );

    expect(screen.getByRole('cell', { name: 'Nothing here' })).toBeInTheDocument();
  });
});

describe('TablePagination', () => {
  it('announces the range and disables the control at each end', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <TablePagination
        page={1}
        pageCount={3}
        pageSize={10}
        from={1}
        to={10}
        total={25}
        pageSizeOptions={[10, 25]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemsLabel="fruits"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Showing 1–10 of 25 fruits');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
