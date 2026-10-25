import type { ReactNode } from 'react';
import { Wordmark } from '../../components/Wordmark';

/** Centred card used by the sign-in and registration screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Wordmark className="mb-8 text-title3" />
      <div className="w-full max-w-[400px] rounded-[28px] bg-surface px-6 py-8 shadow-card sm:px-8">
        <h1 className="text-title1 font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-callout text-label-2">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-callout text-label-2">{footer}</p>
    </main>
  );
}
