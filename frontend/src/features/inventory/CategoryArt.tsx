import { Bus, Car, CarFront, Truck, Zap } from 'lucide-react';
import type { Category } from '../../lib/api/types';
import { categoryLabel } from '../../lib/format';
import { cn } from '../../lib/cn';

const ICONS: Record<Category, typeof Car> = {
  SEDAN: Car,
  SUV: CarFront,
  HATCHBACK: Car,
  COUPE: Car,
  CONVERTIBLE: Car,
  TRUCK: Truck,
  VAN: Bus,
  ELECTRIC: Zap,
};

/** Soft per-category tint so the grid is easy to scan; works in light and dark mode. */
const TINTS: Record<Category, string> = {
  SEDAN: 'from-sky-500/20',
  SUV: 'from-emerald-500/20',
  HATCHBACK: 'from-amber-500/20',
  COUPE: 'from-rose-500/20',
  CONVERTIBLE: 'from-orange-500/20',
  TRUCK: 'from-stone-500/25',
  VAN: 'from-violet-500/20',
  ELECTRIC: 'from-teal-500/20',
};

/** Placeholder shown when a vehicle has no photo (decision Q14). Decorative. */
export function CategoryArt({
  category,
  compact = false,
}: {
  category: Category;
  compact?: boolean;
}) {
  const Icon = ICONS[category];
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex size-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br to-transparent bg-surface-2 text-label-2',
        TINTS[category],
      )}
    >
      <Icon className={compact ? 'size-6' : 'size-12'} strokeWidth={1.5} />
      {!compact && <span className="text-footnote font-medium">{categoryLabel(category)}</span>}
    </div>
  );
}
