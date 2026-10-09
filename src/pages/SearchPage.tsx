import { SearchPanel } from '@/features/search';

export function SearchPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Live Search</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Results appear as you type, once you pause for a moment.
        </p>
      </div>
      <SearchPanel />
    </section>
  );
}
