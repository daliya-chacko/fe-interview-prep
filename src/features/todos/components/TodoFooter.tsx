import { Button } from '@/shared/components/ui';

import { selectCompletedCount, selectRemainingCount, useTodosStore } from '../store/todos.store';

export function TodoFooter() {
  const remaining = useTodosStore(selectRemainingCount);
  const completed = useTodosStore(selectCompletedCount);
  const clearCompleted = useTodosStore((state) => state.clearCompleted);

  return (
    <div className="flex items-center justify-between gap-4">
      <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
        {remaining} {remaining === 1 ? 'item' : 'items'} left
      </p>
      <Button variant="secondary" size="sm" disabled={completed === 0} onClick={clearCompleted}>
        Clear completed
      </Button>
    </div>
  );
}
