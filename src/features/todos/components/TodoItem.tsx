import { type KeyboardEvent, useRef, useState } from 'react';

import { Button, Input } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

import type { Todo } from '../model/todo.schema';
import { useTodosStore } from '../store/todos.store';

export type TodoItemProps = {
  todo: Todo;
};

/** Focuses the edit field as soon as it mounts, with the title selected for quick replacement. */
function focusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export function TodoItem({ todo }: TodoItemProps) {
  const toggleTodo = useTodosStore((state) => state.toggleTodo);
  const updateTitle = useTodosStore((state) => state.updateTitle);
  const removeTodo = useTodosStore((state) => state.removeTodo);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  // Set once the edit is committed or cancelled so a blur fired by unmounting does not commit twice.
  const settledRef = useRef(false);

  const checkboxId = `todo-${todo.id}`;
  const editId = `todo-${todo.id}-title`;

  function startEditing() {
    settledRef.current = false;
    setDraft(todo.title);
    setIsEditing(true);
  }

  function commitEdit() {
    if (settledRef.current) {
      return;
    }
    settledRef.current = true;
    updateTitle(todo.id, draft);
    setIsEditing(false);
  }

  function cancelEdit() {
    settledRef.current = true;
    setIsEditing(false);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  }

  return (
    <li className="flex items-center gap-3 py-3">
      {isEditing ? (
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={editId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Edit todo
          </label>
          <Input
            id={editId}
            ref={focusAndSelect}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
          />
        </div>
      ) : (
        <>
          <input
            id={checkboxId}
            type="checkbox"
            checked={todo.completed}
            onChange={() => {
              toggleTodo(todo.id);
            }}
            className="size-4 shrink-0 accent-indigo-600"
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'flex-1 break-words',
              todo.completed && 'text-zinc-400 line-through dark:text-zinc-500',
            )}
          >
            {todo.title}
          </label>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${todo.title}`}
            onClick={startEditing}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            aria-label={`Delete ${todo.title}`}
            onClick={() => {
              removeTodo(todo.id);
            }}
          >
            Delete
          </Button>
        </>
      )}
    </li>
  );
}
