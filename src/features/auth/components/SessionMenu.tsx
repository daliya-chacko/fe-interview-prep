import { NavLink } from 'react-router';

import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

import { useLogout } from '../hooks/useLogout';
import { useSession } from '../hooks/useSession';

export type SessionMenuProps = {
  loginPath: string;
  className?: string;
};

/**
 * Header slot: who is signed in plus a Logout button, or a link to the login page. Renders
 * nothing while a session is being restored so a reload does not flash "Log in" first.
 */
export function SessionMenu({ loginPath, className }: SessionMenuProps) {
  const { user, isRestoring } = useSession();
  const logout = useLogout();

  if (isRestoring) {
    return null;
  }

  if (!user) {
    return (
      <NavLink
        to={loginPath}
        className={({ isActive }) =>
          cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
            className,
          )
        }
      >
        Log in
      </NavLink>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <span className="text-zinc-600 dark:text-zinc-400">
        Signed in as{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</span>
      </span>
      <Button variant="secondary" size="sm" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
