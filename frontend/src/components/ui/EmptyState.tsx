import type { ReactNode } from 'react';

/** Centred message for empty, no-results and error states, with an optional action. */
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
    <div className="flex flex-col items-center rounded-lg bg-surface px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-plate text-ink-2">
        {icon}
      </div>
      <h2 className="text-car wide font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-body text-ink-2">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
