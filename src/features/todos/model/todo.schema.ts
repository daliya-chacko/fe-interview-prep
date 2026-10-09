import { z } from 'zod';

export const todoSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  completed: z.boolean(),
  /** Epoch milliseconds; a number so it survives JSON without a custom reviver. */
  createdAt: z.number().int().nonnegative(),
});

export type Todo = z.infer<typeof todoSchema>;

export const todoFilterSchema = z.enum(['All', 'Active', 'Completed']);

export type TodoFilter = z.infer<typeof todoFilterSchema>;

export const TODO_FILTERS = todoFilterSchema.options;

/** The slice of the todos store that is written to storage and read back on load. */
export const persistedTodosSchema = z.object({
  todos: z.array(todoSchema),
  filter: todoFilterSchema,
});

export type PersistedTodos = z.infer<typeof persistedTodosSchema>;
