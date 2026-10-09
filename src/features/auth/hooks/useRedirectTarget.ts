import { useLocation, useSearchParams } from 'react-router';

import { resolveRedirectTarget } from '../model/redirect-target';

/** Where the login page sends the user once they are signed in. */
export function useRedirectTarget(fallback: string): string {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return resolveRedirectTarget({ state: location.state, searchParams, fallback });
}
