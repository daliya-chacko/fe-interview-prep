import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { paths } from '@/app/router/paths';
import { Button, buttonClassName } from '@/shared/components/ui';

function describeError(error: unknown): { title: string; detail?: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: error.status === 404 ? 'Page not found' : `Error ${error.status}`,
      detail: error.statusText || undefined,
    };
  }
  if (error instanceof Error) {
    return { title: 'Something went wrong', detail: error.message };
  }
  return { title: 'Something went wrong' };
}

/** Catches render/loader errors for the whole route tree so the shell never goes blank. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const { title, detail } = describeError(error);

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {detail ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{detail}</p> : null}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </Button>
        <Link to={paths.home} className={buttonClassName()}>
          Go home
        </Link>
      </div>
    </main>
  );
}
