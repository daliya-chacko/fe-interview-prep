import { UsersTable } from '@/features/users';

export function UsersPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Sort, search, filter and page through the dataset. The view lives in the URL, so copy the
          link to share exactly what you see.
        </p>
      </div>
      <UsersTable />
    </section>
  );
}
