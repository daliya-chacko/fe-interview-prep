import { Outlet } from 'react-router';

import { useSession } from '../hooks/useSession';

/**
 * Layout route nested under `RequireAuth` for admin-only pages. A signed-in user without the
 * admin role sees a forbidden message in place of the page; nothing crashes and nothing is fetched.
 */
export function RequireAdmin() {
  const { isAdmin } = useSession();

  if (!isAdmin) {
    return (
      <section
        role="alert"
        className="mx-auto max-w-lg space-y-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
      >
        <h1 className="text-xl font-semibold">Admins only</h1>
        <p className="text-sm">Your account does not have access to this page.</p>
      </section>
    );
  }

  return <Outlet />;
}
