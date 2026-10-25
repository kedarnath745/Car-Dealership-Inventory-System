import { stockLabel, stockStatus } from '../../lib/stock';
import { cn } from '../../lib/cn';

const TONE = {
  'in-stock': { dot: 'bg-success', text: 'text-success' },
  low: { dot: 'bg-warning', text: 'text-warning' },
  'sold-out': { dot: 'bg-ink-3', text: 'text-ink-2' },
} as const;

/**
 * Stock as a dot plus text in the card's price row (visual identity D.8). The text
 * always carries the meaning, so status never relies on colour alone (WCAG 1.4.1, D27).
 */
export function StockBadge({ quantity, className }: { quantity: number; className?: string }) {
  const tone = TONE[stockStatus(quantity)];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-small font-medium whitespace-nowrap',
        tone.text,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', tone.dot)} />
      {stockLabel(quantity)}
    </span>
  );
}
