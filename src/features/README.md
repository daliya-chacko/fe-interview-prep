# Features

Each product capability lives in its own folder here and exposes a single public entry point.
Pages and other features import from `@/features/<name>` only, never from a feature's internals.

```
src/features/<name>/
├── api/          # fetch functions + TanStack Query `queryOptions` / hooks
├── components/   # feature-specific UI
├── hooks/        # feature-specific hooks
├── model/        # zod schemas and the types inferred from them
├── store/        # zustand stores for client-owned state (if any)
├── mocks.ts      # MSW handlers for this feature (spread into src/mocks/handlers.ts)
└── index.ts      # the public API of the feature
```

Guidelines:

- Server state belongs in TanStack Query; client-only state belongs in zustand or component state.
- Validate every API response with a zod schema in `api/` so drift fails at the boundary.
- Forms use react-hook-form with `zodResolver`; keep the form schema in `model/`.
- Co-locate tests as `*.test.ts(x)` next to the code they cover.
