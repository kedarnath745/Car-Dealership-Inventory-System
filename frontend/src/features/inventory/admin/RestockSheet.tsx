import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Sheet } from '../../../components/ui/Sheet';
import { Stepper } from '../../../components/ui/Stepper';
import { ApiError } from '../../../lib/api';
import { vehiclesApi } from '../../../lib/api/endpoints';
import type { Vehicle } from '../../../lib/api/types';
import { replaceCachedVehicle } from '../vehicleCache';

/** Matches the API's per-restock limit. */
const MAX_RESTOCK = 10_000;

/** Adds stock to one vehicle with a before → after preview (US-A4). */
export function RestockSheet({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={vehicle !== null} onClose={onClose} title="Restock">
      {vehicle && <RestockForm vehicle={vehicle} onDone={onClose} />}
    </Sheet>
  );
}

function RestockForm({ vehicle, onDone }: { vehicle: Vehicle; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [units, setUnits] = useState(1);
  const restock = useMutation({
    mutationFn: () => vehiclesApi.restock(vehicle.id, units),
    onSuccess: (updated) => {
      replaceCachedVehicle(queryClient, updated);
      toast.success(`Restocked ${updated.make} ${updated.model}: ${updated.quantity} in stock`);
      onDone();
    },
  });

  return (
    <div className="flex flex-col gap-4 pb-2">
      <p className="text-body font-semibold">
        {vehicle.make} {vehicle.model}
      </p>
      <div className="flex items-center justify-between gap-3 rounded-md bg-plate px-4 py-2.5">
        <span className="text-body">Units to add</span>
        <Stepper
          label="Units to add"
          value={units}
          min={1}
          max={MAX_RESTOCK}
          onChange={setUnits}
          initialFocus
        />
      </div>
      <p aria-live="polite" className="text-body text-ink-2 tabular-nums">
        Stock after restock: {vehicle.quantity} → {vehicle.quantity + units}
      </p>
      {restock.error && (
        <Alert>
          {restock.error instanceof ApiError
            ? restock.error.message
            : 'Something went wrong. Please try again.'}
        </Alert>
      )}
      <Button
        size="lg"
        fullWidth
        loading={restock.isPending}
        loadingText="Restocking…"
        onClick={() => restock.mutate()}
      >
        {`Add ${units} ${units === 1 ? 'unit' : 'units'}`}
      </Button>
    </div>
  );
}
