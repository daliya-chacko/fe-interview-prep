import { OrdersPanel } from '@/features/auth';

export function OrdersPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Only signed-in users can see this page. Expired tokens are refreshed for you.
        </p>
      </header>

      <OrdersPanel />
    </section>
  );
}
