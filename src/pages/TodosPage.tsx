import { TodoFilters, TodoFooter, TodoForm, TodoList } from '@/features/todos';

export function TodosPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your list and the chosen filter are saved in this browser, so a refresh keeps them.
        </p>
      </header>

      <TodoForm />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <TodoFilters />
        <TodoList />
        <TodoFooter />
      </div>
    </section>
  );
}
