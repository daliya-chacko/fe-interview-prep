# fe-interview-prep

Front-end interview preparation app. This repository currently contains the application
foundation: tooling, architecture and an app shell with no product features yet.

## Submission

Each question is one branch, one pull request and one merge, in order from 1 to 5. Every question
lives on its own route.

| #   | Question                 | PR link                                                   |
| --- | ------------------------ | --------------------------------------------------------- |
| 1   | Todo App                 | https://github.com/daliya-chacko/fe-interview-prep/pull/6 |
| 2   | Live Search              | https://github.com/daliya-chacko/fe-interview-prep/pull/7 |
| 3   | Registration Wizard      | https://github.com/daliya-chacko/fe-interview-prep/pull/8 |
| 4   | Data Table               | https://github.com/daliya-chacko/fe-interview-prep/pull/9 |
| 5   | Login & Session Handling |                                                           |

Video:

## Stack

| Concern      | Choice                                                     | Why                                                                                  |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Build        | Vite 8 (Rolldown)                                          | Fast dev server, first-class TS/JSX, simple config, code-splitting out of the box.   |
| Language     | TypeScript 6, `strict` + `noUncheckedIndexedAccess`        | Catches whole classes of bugs at compile time; strictness is cheapest from day one.  |
| UI           | React 19                                                   | Current stable; ref-as-prop, Actions and automatic batching.                         |
| Routing      | React Router 8 (data mode, `createBrowserRouter`)          | Nested layouts, lazy routes, error boundaries and pending state without a framework. |
| Server state | TanStack Query 5                                           | Caching, deduplication, retries and invalidation modelled explicitly.                |
| Client state | Zustand 5                                                  | Tiny, hook-based, no boilerplate; `persist` middleware for local-only state.         |
| Forms        | React Hook Form 7 + Zod 4 (`@hookform/resolvers`)          | Uncontrolled performance with schema-driven validation; one schema for form and API. |
| Styling      | Tailwind CSS 4                                             | Utility-first with design tokens via `@theme`; `cn()` merges conflicting classes.    |
| API mocking  | MSW 2                                                      | Same handlers serve the browser in dev and Node in tests; no fetch stubbing.         |
| Tests        | Vitest 5 + Testing Library + jsdom                         | Fast, Vite-native runner; tests exercise the DOM the way a user would.               |
| Lint/format  | ESLint 9 (typescript-eslint strict, a11y, hooks), Prettier | Type-aware linting plus accessibility rules; formatting is not a code-review topic.  |

## Getting started

Requires Node 22.12+ (see `.nvmrc`; Node 24 is used in CI).

```bash
npm ci
npm run dev
```

| Script              | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`       | Start the dev server (MSW mocks enabled via `.env.development`).              |
| `npm run build`     | Typecheck, then produce a production bundle in `dist/`.                       |
| `npm run preview`   | Serve the production bundle locally.                                          |
| `npm run typecheck` | `tsc -b` across app and config projects.                                      |
| `npm run lint`      | ESLint (`lint:fix` applies auto-fixes).                                       |
| `npm run format`    | Prettier (`format:check` for CI).                                             |
| `npm test`          | Run the test suite once (`test:watch` for TDD, `test:coverage` for a report). |
| `npm run validate`  | Everything CI runs: typecheck, lint, format check, tests.                     |

## Project structure

```
src/
├── app/                 # Composition root: providers, router, layouts. No business logic.
│   ├── App.tsx
│   ├── layouts/         # RootLayout (header, nav, <Outlet/>)
│   ├── providers/       # AppProviders, QueryClient factory
│   └── router/          # routes.tsx, paths.ts, error/hydrate fallbacks
├── pages/               # Thin route components; compose features, hold no logic of their own
├── features/            # One folder per product capability (see src/features/README.md)
├── shared/              # Reusable, feature-agnostic code
│   ├── components/ui/   # Design-system primitives (Button, Spinner, …)
│   └── lib/             # cn(), validated env, HTTP client
├── mocks/               # MSW handlers, browser worker and Node server
├── styles/              # Tailwind entry point and theme tokens
├── test/                # Vitest setup and render helpers
└── main.tsx             # Bootstrap: start mocks (if enabled), mount <App/>
```

Dependency direction is one-way: `app` → `pages` → `features` → `shared`. Features never import
from `pages` or `app`, and `shared` never imports from a feature. The `@/` alias points at `src/`.

## Conventions

- **Validate at the boundary.** API responses and environment variables are parsed with Zod
  (`src/shared/lib/http.ts`, `src/shared/lib/env.ts`); the rest of the app trusts the types.
- **Server state vs client state.** Data that comes from an API lives in TanStack Query. State the
  client owns (preferences, drafts, UI) lives in Zustand or component state. Do not copy one into the other.
- **URL as state.** Filters, tabs and anything a user might share or bookmark belong in the URL.
- **Co-located tests** named `*.test.ts(x)`. Prefer user-facing queries (`getByRole`) over test ids.
- **Accessibility is linted** (`jsx-a11y`) and expected: labelled controls, keyboard operability, live regions for async status.
- **No default exports** except where a tool requires one (config files).

## Environment

Vite exposes variables prefixed with `VITE_`. Defaults live in `.env.development` and
`.env.production`; copy `.env.example` to `.env.local` to override locally.

| Variable            | Default | Description                                                |
| ------------------- | ------- | ---------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | Base path or absolute URL for API requests.                |
| `VITE_ENABLE_MOCKS` | `false` | Start the MSW service worker in the browser (dev: `true`). |

## CI

`.github/workflows/ci.yml` runs typecheck, lint, format check, tests with coverage and a
production build on every push to `main` and every pull request.
