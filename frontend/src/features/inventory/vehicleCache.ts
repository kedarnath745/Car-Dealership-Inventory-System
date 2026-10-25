import type { QueryClient } from '@tanstack/react-query';
import type { Vehicle } from '../../lib/api/types';
import { vehicleKeys } from './useVehicles';

/**
 * Applies a server response to every cached vehicle list at once (all filter
 * combinations), so the UI updates immediately, then refetches in the background.
 */
export function replaceCachedVehicle(queryClient: QueryClient, updated: Vehicle): void {
  queryClient.setQueriesData<Vehicle[]>({ queryKey: vehicleKeys.all }, (list) =>
    list?.map((vehicle) => (vehicle.id === updated.id ? updated : vehicle)),
  );
  void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
}

export function removeCachedVehicle(queryClient: QueryClient, id: string): void {
  queryClient.setQueriesData<Vehicle[]>({ queryKey: vehicleKeys.all }, (list) =>
    list?.filter((vehicle) => vehicle.id !== id),
  );
  void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
}
