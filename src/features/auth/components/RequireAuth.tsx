import { Navigate, Outlet, useLocation } from 'react-router';

import { Spinner } from '@/shared/components/ui';

import { useSession } from '../hooks/useSession';

export type RequireAuthProps = {
  /** Where to send a signed-out visitor; passed in because features do not import `paths`. */
  loginPath: string;
};

/**
 * Layout route for pages that need a signed-in user. A visitor with no session is sent to the
 * login page with the page they wanted in router state, so login can bring them back. While a
 * session is being restored after a reload it shows a neutral loading state, never the login
 * page, so a reload does not flash a form the user does not need.
 */
export function RequireAuth({ loginPath }: RequireAuthProps) {
  const { isAuthenticated, isRestoring } = useSession();
  const location = useLocation();

  if (isRestoring) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Restoring your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={loginPath} replace state={{ from }} />;
  }

  return <Outlet />;
}
