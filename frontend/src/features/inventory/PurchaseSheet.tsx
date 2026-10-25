import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Stepper } from '../../components/ui/Stepper';
import { ApiError } from '../../lib/api';
import { vehiclesApi } from '../../lib/api/endpoints';
import type { Vehicle } from '../../lib/api/types';
import { categoryLabel, formatINR } from '../../lib/format';
import { VehicleMedia } from './VehicleMedia';
import { vehicleKeys } from './useVehicles';

/** Matches the API's per-order limit (D4, Q6). */
const MAX_PER_ORDER = 100;

/**
 * Purchase confirmation (D29): the quantity and total are chosen here and the
 * button states the exact amount, because buying a car is a high-value action.
 */
export function PurchaseSheet({
  vehicle,
  onClose,
  onVehicleGone,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
  onVehicleGone: () => void;
}) {
  return (
    <Sheet open={vehicle !== null} onClose={onClose} title="Confirm Purchase" dismissible>
      {vehicle && (
        <PurchaseForm vehicle={vehicle} onClose={onClose} onVehicleGone={onVehicleGone} />
      )}
    </Sheet>
  );
}

function PurchaseForm({
  vehicle,
  onClose,
  onVehicleGone,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onVehicleGone: () => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const max = Math.min(vehicle.quantity, MAX_PER_ORDER);

  // When fresh stock arrives (e.g. after a 409), keep the chosen quantity possible.
  useEffect(() => {
    if (max >= 1 && quantity > max) setQuantity(max);
  }, [max, quantity]);

  const purchase = useMutation({
    mutationFn: () => vehiclesApi.purchase(vehicle.id, quantity),
    onSuccess: ({ vehicle: updated, purchase: bought }) => {
      queryClient.setQueriesData<Vehicle[]>({ queryKey: vehicleKeys.all }, (list) =>
        list?.map((item) => (item.id === updated.id ? updated : item)),
      );
      void queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success(`Purchased ${bought.quantity} × ${bought.make} ${bought.model}`, {
        action: { label: 'View Purchases', onClick: () => navigate('/purchases') },
      });
      onClose();
    },
    onError: (err) => {
      void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      if (err instanceof ApiError && err.status === 404) {
        onVehicleGone();
        return;
      }
      if (err instanceof ApiError && err.code === 'OUT_OF_STOCK') {
        setError('This vehicle just sold out.');
      } else if (err instanceof ApiError && err.code === 'INSUFFICIENT_STOCK') {
        setError(`${err.message}. Someone may have just bought one.`);
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    },
  });

  const total = vehicle.price * quantity;
  const soldOut = max < 1;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex items-center gap-3">
        <VehicleMedia
          vehicle={vehicle}
          compact
          className="h-[45px] w-[72px] shrink-0 rounded-[8px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-headline font-semibold">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="truncate text-subhead text-label-2">
            {vehicle.year} · {vehicle.color} · {categoryLabel(vehicle.category)}
          </p>
        </div>
      </div>

      <dl className="divide-y divide-separator rounded-field bg-surface-2">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-body">Price per vehicle</dt>
          <dd className="text-body tabular-nums">{formatINR(vehicle.price)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <dt>
            <span className="block text-body">Quantity</span>
            <span className="block text-footnote text-label-2">
              {soldOut ? 'Sold out' : `${vehicle.quantity} available`}
            </span>
          </dt>
          <dd>
            <Stepper
              label="Quantity"
              value={quantity}
              min={1}
              max={Math.max(max, 1)}
              onChange={setQuantity}
              disabled={soldOut || purchase.isPending}
              initialFocus
            />
          </dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-headline font-semibold">Total</dt>
          <dd aria-live="polite" className="text-title3 font-semibold tabular-nums">
            {formatINR(total)}
          </dd>
        </div>
      </dl>

      {error && <Alert>{error}</Alert>}

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth
          disabled={soldOut}
          loading={purchase.isPending}
          loadingText="Buying…"
          onClick={() => {
            setError(null);
            purchase.mutate();
          }}
        >
          {soldOut ? 'Sold out' : `Buy for ${formatINR(total)}`}
        </Button>
        <p className="text-center text-footnote text-label-2">
          Demo checkout. No payment is taken.
        </p>
      </div>
    </div>
  );
}
