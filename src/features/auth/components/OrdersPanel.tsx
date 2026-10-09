import { useQuery } from '@tanstack/react-query';

import { Spinner } from '@/shared/components/ui';

import { meQuery, ordersQuery } from '../api/auth.queries';
import { useSession } from '../hooks/useSession';
import type { User } from '../model/auth.schema';
import { LoadFailure } from './LoadFailure';

type AccountSummaryProps = { user: User };

/** Server-confirmed identity from `/me`, so the page shows what the backend thinks, not the store. */
function AccountSummary({ user }: AccountSummaryProps) {
  const me = useQuery(meQuery(user.id));

  if (me.isPending) {
    return <Spinner size="sm" label="Loading your account" />;
  }

  if (me.isError) {
    return (
      <LoadFailure
        message="Could not load your account."
        isRetrying={me.isFetching}
        onRetry={() => {
          void me.refetch();
        }}
      />
    );
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Signed in as{' '}
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{me.data.name}</span> (
      {me.data.email}) with the <span className="font-medium">{me.data.role}</span> role.
    </p>
  );
}

type OrdersListProps = { user: User };

function OrdersList({ user }: OrdersListProps) {
  const orders = useQuery(ordersQuery(user.id));

  if (orders.isPending) {
    return <Spinner size="md" label="Loading orders" />;
  }

  if (orders.isError) {
    return (
      <LoadFailure
        message="Could not load your orders."
        isRetrying={orders.isFetching}
        onRetry={() => {
          void orders.refetch();
        }}
      />
    );
  }

  if (orders.data.orders.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">You have no orders yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Your orders</caption>
      <thead>
        <tr className="border-b border-zinc-200 text-left text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <th scope="col" className="py-2 pr-4 font-medium">
            Order
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Item
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Placed
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {orders.data.orders.map((order) => (
          <tr key={order.id}>
            <th scope="row" className="py-2 pr-4 font-mono font-normal">
              {order.id}
            </th>
            <td className="py-2 pr-4">{order.item}</td>
            <td className="py-2 pr-4">{order.placedAt}</td>
            <td className="py-2 text-right">${order.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Protected landing content: the account summary and the order list, each with its own
 * loading, error and empty state. Both requests go out together, which is exactly the burst
 * the single-flight refresh exists for when the access token has expired in the meantime.
 */
export function OrdersPanel() {
  const { user } = useSession();

  // Only reachable through `RequireAuth`; the guard renders nothing here once a logout clears the user.
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AccountSummary user={user} />
      <OrdersList user={user} />
    </div>
  );
}
