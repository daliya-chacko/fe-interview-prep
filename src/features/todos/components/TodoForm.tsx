import { type SubmitEvent, useState } from 'react';

import { Button, Input } from '@/shared/components/ui';

import { useTodosStore } from '../store/todos.store';

const INPUT_ID = 'new-todo-title';

export function TodoForm() {
  const addTodo = useTodosStore((state) => state.addTodo);
  const [title, setTitle] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim() === '') {
      return;
    }
    addTodo(title);
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <label htmlFor={INPUT_ID} className="text-sm font-medium">
        New todo
      </label>
      <div className="flex gap-2">
        <Input
          id={INPUT_ID}
          name="title"
          value={title}
          placeholder="What needs doing?"
          autoComplete="off"
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
}
