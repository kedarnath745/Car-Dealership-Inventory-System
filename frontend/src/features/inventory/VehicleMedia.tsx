import { useState } from 'react';
import type { Vehicle } from '../../lib/api/types';
import { cn } from '../../lib/cn';
import { CategoryArt } from './CategoryArt';

/** The vehicle's photo, falling back to its category illustration if missing or broken. */
export function VehicleMedia({
  vehicle,
  compact = false,
  eager = false,
  className,
}: {
  vehicle: Vehicle;
  compact?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = vehicle.imageUrl && !failed;
  return (
    <div className={cn('overflow-hidden', className)}>
      {showImage ? (
        <img
          src={vehicle.imageUrl ?? undefined}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.color}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover dark:brightness-[0.92]"
        />
      ) : (
        <CategoryArt category={vehicle.category} color={vehicle.color} compact={compact} />
      )}
    </div>
  );
}
