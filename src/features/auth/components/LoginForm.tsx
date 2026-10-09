import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router';

import { Button, Input } from '@/shared/components/ui';
import { isHttpError } from '@/shared/lib/http';

import { useLogin } from '../hooks/useLogin';
import { useRedirectTarget } from '../hooks/useRedirectTarget';
import { useSession } from '../hooks/useSession';
import { type LoginRequest, loginRequestSchema } from '../model/auth.schema';

export type LoginFormProps = {
  /** Where to go after login when nothing asked for a specific page. */
  fallbackPath: string;
};

function describeFailure(error: unknown): string {
  if (isHttpError(error, 401)) return 'Incorrect email or password.';
  return 'Could not sign you in. Please try again.';
}

/**
 * Email and password form. Once a session exists, whether it was created by this form or was
 * already there, it redirects to the page the visitor originally asked for.
 */
export function LoginForm({ fallbackPath }: LoginFormProps) {
  const id = useId();
  const { isAuthenticated } = useSession();
  const redirectTo = useRedirectTarget(fallbackPath);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const emailId = `${id}-email`;
  const emailErrorId = `${id}-email-error`;
  const passwordId = `${id}-password`;
  const passwordErrorId = `${id}-password-error`;

  return (
    <form
      noValidate
      aria-busy={login.isPending || undefined}
      onSubmit={handleSubmit((values) => {
        login.mutate(values);
      })}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="block text-sm font-medium">
          Email
        </label>
        <Input
          id={emailId}
          type="email"
          autoComplete="username"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? emailErrorId : undefined}
          {...register('email')}
        />
        <p
          id={emailErrorId}
          aria-live="polite"
          className="min-h-5 text-sm text-red-700 dark:text-red-300"
        >
          {errors.email?.message}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="block text-sm font-medium">
          Password
        </label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          {...register('password')}
        />
        <p
          id={passwordErrorId}
          aria-live="polite"
          className="min-h-5 text-sm text-red-700 dark:text-red-300"
        >
          {errors.password?.message}
        </p>
      </div>

      {login.isError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {describeFailure(login.error)}
        </p>
      ) : null}

      <Button type="submit" isLoading={login.isPending}>
        {login.isPending ? 'Signing in…' : 'Log in'}
      </Button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Demo accounts: <code>admin@example.com</code> / <code>admin123</code> (admin) and{' '}
        <code>user@example.com</code> / <code>user123</code> (regular user).
      </p>
    </form>
  );
}
