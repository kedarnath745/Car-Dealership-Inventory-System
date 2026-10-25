import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import type { Vehicle } from '../../lib/api/types';
import { categoryLabel, formatINR, formatPriceHint } from '../../lib/format';
import { cn } from '../../lib/cn';
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
 * One vehicle. Not a link (there is no detail page), so its buttons are the only
 * interactive elements. The quantity choice happens in the purchase sheet (D29).
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
      className="flex flex-col rounded-lg bg-surface p-2 transition-shadow duration-200 ease-standard hover:"
    >
      <div className="relative">
        <VehicleMedia
          vehicle={vehicle}
          eager={eagerImage}
          className={cn('aspect-[16/10] rounded-md', soldOut && 'opacity-60')}
        />
        <StockBadge quantity={vehicle.quantity} className="absolute top-2 right-2 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
        <h2 id={titleId} className="line-clamp-2 text-car wide font-semibold tracking-tight">
          {vehicle.make} {vehicle.model}
        </h2>
        <p className="mt-0.5 text-small text-ink-2">
          {vehicle.year} · {vehicle.color} · {categoryLabel(vehicle.category)}
        </p>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-car wide font-semibold tabular-nums">
            {formatINR(vehicle.price)}
          </span>
          {hint && <span className="text-micro text-ink-2">{hint}</span>}
        </p>
        <div className="mt-auto pt-4">
          {primaryAction ??
            (soldOut ? (
              <>
                <Button fullWidth disabled className="bg-plate text-ink-2 disabled:opacity-100">
                  Sold out
                </Button>
                <p className="mt-1.5 text-center text-micro text-ink-2">Check back after restock</p>
              </>
            ) : (
              <Button fullWidth onClick={() => onPurchase(vehicle)}>
                Purchase
              </Button>
            ))}
          {adminActions}
        </div>
      </div>
    </article>
  );
}
