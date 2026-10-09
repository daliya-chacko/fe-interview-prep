import { useEffect } from 'react';

import { refreshSession } from '../api/auth.client';
import { selectIsRestoring, useSessionStore } from '../store/session.store';

/**
 * Restores the session after a reload. When a refresh token was read back from storage but no
 * user is loaded yet, it exchanges that token for a new session before any protected content
 * renders; guards show a neutral loading state meanwhile, never the login page.
 *
 * Mount it once, high in the tree. The refresh is single-flight and writes to the global store,
 * so an unmount has nothing to cancel and a StrictMode double effect costs no extra request.
 * A failed refresh clears the store itself, which is what turns the loading state into login.
 */
export function useSessionBootstrap(): void {
  const isRestoring = useSessionStore(selectIsRestoring);

  useEffect(() => {
    if (!isRestoring) return;
    void refreshSession().catch(() => undefined);
  }, [isRestoring]);
}
