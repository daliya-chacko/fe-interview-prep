import { useMutation } from '@tanstack/react-query';

import { login } from '../api/auth.api';
import { useSessionStore } from '../store/session.store';

/** Signs in with email and password; on success the session store holds the new tokens. */
export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
