import { useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '../store/session.store';

/**
 * Signs out: drops the tokens (including the persisted refresh token) and empties the query
 * cache so nothing fetched on behalf of this user survives into the next session.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((state) => state.clearSession);

  return () => {
    clearSession();
    queryClient.clear();
  };
}
