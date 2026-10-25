import { CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Inline message block. Errors use role="alert" so screen readers announce them at once. */
export function Alert({
  tone = 'error',
  children,
  className,
}: {
  tone?: 'error' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-field px-3 py-2.5 text-callout',
        tone === 'error' ? 'bg-danger-tint text-danger-text' : 'bg-accent-tint text-accent-text',
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div>{children}</div>
    </div>
  );
}
