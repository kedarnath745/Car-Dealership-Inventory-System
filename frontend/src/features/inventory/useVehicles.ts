import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../../lib/api/endpoints';
import { type Filters, toApiQuery } from '../../lib/filters';

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (query: string) => ['vehicles', query] as const,
};

/**
 * Vehicles for the current filters: the plain list endpoint without filters, the
 * search endpoint with them (DESIGN §5). Previous results stay on screen while the
 * next ones load, so the grid never blanks out between keystrokes.
 */
export function useVehicles(filters: Filters, { enabled }: { enabled: boolean }) {
  const apiQuery = toApiQuery(filters);
  return useQuery({
    queryKey: vehicleKeys.list(apiQuery?.toString() ?? ''),
    queryFn: () => (apiQuery ? vehiclesApi.search(apiQuery) : vehiclesApi.list()),
    enabled,
    placeholderData: keepPreviousData,
  });
}
