import { paths } from '@/app/router/paths';
import { LoginForm } from '@/features/auth';

export function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Log in</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sign in to see your orders. Your session is kept alive in the background.
        </p>
      </header>

      <LoginForm fallbackPath={paths.orders} />
    </section>
  );
}
