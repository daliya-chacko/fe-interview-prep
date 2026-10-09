import { AdminStatsPanel } from '@/features/auth';

export function AdminStatsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin statistics</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Visible to admin accounts only.</p>
      </header>

      <AdminStatsPanel />
    </section>
  );
}
