import type { User } from '../model/auth.schema';
import { selectIsRestoring, selectUser, useSessionStore } from '../store/session.store';

export type SessionSnapshot = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** A refresh token survived a reload and the session is being restored from it. */
  isRestoring: boolean;
};

/** The signed-in user as the client knows it. Server-fresh details come from `meQuery`. */
export function useSession(): SessionSnapshot {
  const user = useSessionStore(selectUser);
  const isRestoring = useSessionStore(selectIsRestoring);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isRestoring,
  };
}
