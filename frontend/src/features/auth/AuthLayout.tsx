import type { ReactNode } from 'react';
import { Wordmark } from '../../components/Wordmark';
import { CategoryArt } from '../inventory/CategoryArt';

/**
 * Sign-in and registration (visual identity D.12): on wide screens a studio-plate
 * panel on the left and the form on the right; on phones the form sits directly on
 * the page. No card around the form.
 */
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
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-plate p-10 lg:flex"
      >
        <Wordmark />
        <p className="wide max-w-sm text-title font-semibold">
          Cars in stock today, priced in rupees.
        </p>
        <div className="relative -mx-10 -mb-10 h-[46%]">
          <CategoryArt category="SUV" />
        </div>
      </aside>
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center">
        <Wordmark className="lg:hidden" />
        <div className="mt-12 w-full max-w-[400px] lg:mx-auto lg:mt-0">
          <h1 className="wide text-display font-semibold">{title}</h1>
          <p className="mt-1.5 text-body text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-body text-ink-2">{footer}</p>
        </div>
      </main>
    </div>
  );
}
