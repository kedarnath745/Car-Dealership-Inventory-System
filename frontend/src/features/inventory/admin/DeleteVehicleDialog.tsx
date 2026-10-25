import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Sheet } from '../../../components/ui/Sheet';
import { ApiError } from '../../../lib/api';
import { vehiclesApi } from '../../../lib/api/endpoints';
import type { Vehicle } from '../../../lib/api/types';
import { removeCachedVehicle } from '../vehicleCache';

/**
 * Specific, non-default confirmation for a destructive action (D30, NN/g): the title
 * names the vehicle, Cancel has focus, and the red button says exactly what happens.
 */
export function DeleteVehicleDialog({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: (target: Vehicle) => vehiclesApi.remove(target.id),
    onSuccess: (_result, target) => done(target),
    onError: (error, target) => {
      // Already gone: the outcome the admin wanted, so treat it as done.
      if (error instanceof ApiError && error.status === 404) done(target);
    },
  });

  function done(target: Vehicle) {
    removeCachedVehicle(queryClient, target.id);
    toast.success(`Deleted ${target.make} ${target.model}`);
    remove.reset();
    onClose();
  }

  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Sheet
      open={vehicle !== null}
      onClose={close}
      variant="alert"
      dismissible={!remove.isPending}
      title={vehicle ? `Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?` : ''}
      description="It will be removed from inventory. Past purchases stay in purchase history."
    >
      {vehicle && (
        <div className="flex flex-col gap-3">
          {remove.isError && !(remove.error instanceof ApiError && remove.error.status === 404) && (
            <Alert>
              {remove.error instanceof ApiError
                ? remove.error.message
                : 'Something went wrong. Please try again.'}
            </Alert>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="quiet"
              fullWidth
              data-autofocus
              onClick={close}
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              fullWidth
              loading={remove.isPending}
              loadingText="Deleting…"
              onClick={() => remove.mutate(vehicle)}
            >
              Delete vehicle
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
