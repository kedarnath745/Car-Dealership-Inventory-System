import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { stockLabel, stockStatus } from '../../lib/stock';

/** Stock state as text + icon + colour, never colour alone (WCAG 1.4.1, D27). */
export function StockBadge({ quantity, className }: { quantity: number; className?: string }) {
  const status = stockStatus(quantity);
  const icon = status === 'sold-out' ? CircleX : status === 'low' ? TriangleAlert : CircleCheck;
  const Icon = icon;
  return (
    <Badge
      tone={status === 'sold-out' ? 'neutral' : status === 'low' ? 'warning' : 'success'}
      icon={<Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />}
      className={className}
    >
      {stockLabel(quantity)}
    </Badge>
  );
}
