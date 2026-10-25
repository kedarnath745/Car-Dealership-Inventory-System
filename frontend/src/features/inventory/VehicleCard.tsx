import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import type { Vehicle } from '../../lib/api/types';
import { cn } from '../../lib/cn';
import { categoryLabel, formatINR, formatPriceHint } from '../../lib/format';
import { StockBadge } from './StockBadge';
import { VehicleMedia } from './VehicleMedia';

export interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (vehicle: Vehicle) => void;
  /** Extra controls rendered under the main action (admin tools). */
  adminActions?: ReactNode;
  /** Replaces the default primary action (e.g. Restock for admins when sold out). */
  primaryAction?: ReactNode;
  eagerImage?: boolean;
}

/**
 * One car (visual identity D.9): a hairline-bordered card with the studio plate flush
 * on top, "year make model" in wide type, a phrase-style meta line, then the price
 * and stock on one row. Not a link: there is no detail page. Quantity is chosen in
 * the purchase sheet (D29).
 */
export function VehicleCard({
  vehicle,
  onPurchase,
  adminActions,
  primaryAction,
  eagerImage,
}: VehicleCardProps) {
  const titleId = `vehicle-${vehicle.id}-title`;
  const soldOut = vehicle.quantity === 0;
  const hint = formatPriceHint(vehicle.price);

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 hover:border-line-strong"
    >
      <VehicleMedia
        vehicle={vehicle}
        eager={eagerImage}
        className={cn('aspect-[16/10]', soldOut && 'opacity-60')}
      />
      <div className="flex flex-1 flex-col p-4">
        <h2 id={titleId} className="wide line-clamp-2 text-car font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <p className="mt-1 text-small text-ink-2">
          {vehicle.color} {categoryLabel(vehicle.category)}
        </p>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="wide text-price font-semibold tabular-nums">{formatINR(vehicle.price)}</p>
            {hint && <p className="text-small text-ink-2">{hint}</p>}
          </div>
          <StockBadge quantity={vehicle.quantity} className="mt-1" />
        </div>
        <div className="mt-auto pt-4">
          {primaryAction ??
            (soldOut ? (
              <>
                <Button variant="secondary" fullWidth disabled>
                  Sold out
                </Button>
                <p className="mt-1.5 text-center text-micro text-ink-2">Back after restock</p>
              </>
            ) : (
              <Button variant="secondary" fullWidth onClick={() => onPurchase(vehicle)}>
                Purchase
              </Button>
            ))}
          {adminActions}
        </div>
      </div>
    </article>
  );
}
