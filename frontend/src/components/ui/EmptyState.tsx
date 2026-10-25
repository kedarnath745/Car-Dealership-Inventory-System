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
    <div className="flex flex-col items-center rounded-card bg-surface px-6 py-14 text-center shadow-card">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-surface-2 text-label-2">
        {icon}
      </div>
      <h2 className="text-title3 font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-callout text-label-2">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
