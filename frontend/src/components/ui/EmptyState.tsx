import type { ReactNode } from 'react';

/**
 * Status plus a way out (visual identity D.13): left-aligned on the page with a quiet
 * icon, no card around it.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex max-w-md flex-col items-start border-t border-line py-10">
      <div className="mb-3 text-ink-2">{icon}</div>
      <h2 className="wide text-title font-semibold">{title}</h2>
      {description && <p className="mt-1 text-body text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
