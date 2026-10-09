import { NavLink, Outlet, useNavigation } from 'react-router';

import { paths } from '@/app/router/paths';
import { cn } from '@/shared/lib/cn';

/** Top-level navigation. Add an entry here when a feature registers a route. */
const navItems = [
  { to: paths.home, label: 'Home', end: true },
  { to: paths.todos, label: 'Todos', end: false },
  { to: paths.search, label: 'Search', end: false },
  { to: paths.register, label: 'Register', end: false },
] as const;

export function RootLayout() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow dark:focus:bg-zinc-900"
      >
        Skip to content
      </a>

      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
          <NavLink to={paths.home} className="text-base font-semibold tracking-tight">
            FE Interview Prep
          </NavLink>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Global pending indicator for lazy route chunks and loaders. */}
        <div
          aria-hidden="true"
          className={cn(
            'h-0.5 bg-indigo-500 transition-opacity',
            isNavigating ? 'animate-pulse opacity-100' : 'opacity-0',
          )}
        />
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
