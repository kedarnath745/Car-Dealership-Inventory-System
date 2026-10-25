import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'success' | 'warning' | 'neutral' | 'accent';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning',
  neutral: 'bg-plate text-ink-2',
  accent: 'bg-accent-tint text-accent',
};

/** Small rectangular label (6px radius). Always carries text, never colour alone. */
export function Badge({
  tone,
  icon,
  className,
  children,
}: {
  tone: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1 rounded-sm px-1.5 text-micro font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
