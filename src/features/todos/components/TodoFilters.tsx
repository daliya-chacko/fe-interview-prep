import { TODO_FILTERS, type TodoFilter } from '../model/todo.schema';
import { useTodosStore } from '../store/todos.store';

/**
 * Filter picker as a native radio group styled like a segmented control. The radios are
 * visually hidden but stay keyboard operable; the wrapping labels carry the visible state.
 */
export function TodoFilters() {
  const filter = useTodosStore((state) => state.filter);
  const setFilter = useTodosStore((state) => state.setFilter);

  return (
    <fieldset className="flex items-center gap-3">
      <legend className="sr-only">Filter todos</legend>
      <span aria-hidden="true" className="text-sm font-medium">
        Show
      </span>
      <div className="inline-flex rounded-md bg-zinc-100 p-1 dark:bg-zinc-800">
        {TODO_FILTERS.map((option: TodoFilter) => {
          const id = `todo-filter-${option.toLowerCase()}`;
          return (
            <label
              key={option}
              htmlFor={id}
              className="cursor-pointer rounded px-3 py-1 text-sm font-medium text-zinc-600 transition-colors has-checked:bg-white has-checked:text-zinc-900 has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-500 dark:text-zinc-400 dark:has-checked:bg-zinc-900 dark:has-checked:text-zinc-50"
            >
              <input
                id={id}
                type="radio"
                name="todo-filter"
                value={option}
                checked={filter === option}
                onChange={() => {
                  setFilter(option);
                }}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
