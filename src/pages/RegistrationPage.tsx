import { RegistrationWizard } from '@/features/registration';

export function RegistrationPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Register</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Three short steps, then a review before you submit. Your progress is saved as you go.
        </p>
      </div>
      <RegistrationWizard />
    </section>
  );
}
