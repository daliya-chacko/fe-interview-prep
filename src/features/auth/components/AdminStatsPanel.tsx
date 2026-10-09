import { useQuery } from '@tanstack/react-query';

import { Spinner } from '@/shared/components/ui';

import { adminStatsQuery } from '../api/auth.queries';
import { useSession } from '../hooks/useSession';
import type { User } from '../model/auth.schema';
import { LoadFailure } from './LoadFailure';

type AdminStatsProps = { user: User };

function AdminStats({ user }: AdminStatsProps) {
  const stats = useQuery(adminStatsQuery(user.id));

  if (stats.isPending) {
    return <Spinner size="md" label="Loading statistics" />;
  }

  if (stats.isError) {
    return (
      <LoadFailure
        message="Could not load the statistics."
        isRetrying={stats.isFetching}
        onRetry={() => {
          void stats.refetch();
        }}
      />
    );
  }

  const items = [
    { label: 'Users', value: stats.data.users.toLocaleString() },
    { label: 'Orders', value: stats.data.orders.toLocaleString() },
    { label: 'Revenue', value: `$${stats.data.revenue.toLocaleString()}` },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <dt className="text-sm text-zinc-600 dark:text-zinc-400">{item.label}</dt>
          <dd className="text-2xl font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Admin-only numbers from `/admin/stats`. Only rendered under `RequireAdmin`. */
export function AdminStatsPanel() {
  const { user } = useSession();

  // Only reachable through the guards; renders nothing once a logout clears the user.
  if (!user) {
    return null;
  }

  return <AdminStats user={user} />;
}
