import { useQueryClient } from '@tanstack/react-query';
import { CarFront, RotateCw, SearchX } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import type { Vehicle } from '../../lib/api/types';
import {
  DEFAULT_FILTERS,
  type Filters,
  hasActiveFilters,
  parseFilters,
  removeFilter,
  sortVehicles,
  toSearchParams,
  validateFilters,
} from '../../lib/filters';
import { FilterBar } from './FilterBar';
import { PurchaseSheet } from './PurchaseSheet';
import { ResultsBar } from './ResultsBar';
import { VehicleCard } from './VehicleCard';
import { VehicleGridSkeleton } from './VehicleGridSkeleton';
import { useVehicles, vehicleKeys } from './useVehicles';

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4';

/** The dashboard: every vehicle, with filters, sorting and purchasing (US-S3 to US-S6). */
export function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);
  const filtersValid = Object.keys(validateFilters(filters)).length === 0;
  const vehiclesQuery = useVehicles(filters, { enabled: filtersValid });
  const showSkeleton = useDelayedFlag(vehiclesQuery.isPending, 300);

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const setFilters = (next: Filters) => setSearchParams(toSearchParams(next), { replace: true });
  const clearFilters = () => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort });

  const vehicles = vehiclesQuery.data ? sortVehicles(vehiclesQuery.data, filters.sort) : null;
  const purchasing = vehicles?.find((vehicle) => vehicle.id === purchasingId) ?? null;

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-4">
        <h1 className="text-title1 font-bold tracking-tight sm:text-large-title">Inventory</h1>
      </header>

      <FilterBar filters={filters} onChange={setFilters} />
      <ResultsBar
        filters={filters}
        count={vehicles ? vehicles.length : null}
        onRemove={(key) => setFilters(removeFilter(filters, key))}
        onClearAll={clearFilters}
        onSortChange={(sort) => setFilters({ ...filters, sort })}
      />

      {notice && (
        <Alert tone="info" className="mt-4">
          {notice}
        </Alert>
      )}

      <div className="mt-4">
        {vehiclesQuery.isError && !vehicles ? (
          <EmptyState
            icon={<RotateCw className="size-6" aria-hidden="true" />}
            title="Couldn't load vehicles"
            description="Check your connection and try again."
            action={
              <Button
                variant="tinted"
                onClick={() => void vehiclesQuery.refetch()}
                loading={vehiclesQuery.isFetching}
              >
                Try Again
              </Button>
            }
          />
        ) : !vehicles ? (
          <div className={GRID} aria-busy="true">
            {showSkeleton && <VehicleGridSkeleton />}
          </div>
        ) : vehicles.length === 0 ? (
          hasActiveFilters(filters) ? (
            <EmptyState
              icon={<SearchX className="size-6" aria-hidden="true" />}
              title="No vehicles match these filters"
              description="Try a wider price range or a different category."
              action={<Button onClick={clearFilters}>Clear Filters</Button>}
            />
          ) : (
            <EmptyState
              icon={<CarFront className="size-6" aria-hidden="true" />}
              title="No vehicles yet"
              description="No vehicles in the showroom yet. Check back soon."
            />
          )
        ) : (
          <div className={GRID}>
            {vehicles.map((vehicle: Vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                eagerImage={index < 4}
                onPurchase={(selected) => {
                  setNotice(null);
                  setPurchasingId(selected.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <PurchaseSheet
        vehicle={purchasing}
        onClose={() => setPurchasingId(null)}
        onVehicleGone={() => {
          setPurchasingId(null);
          setNotice('This vehicle is no longer available.');
          void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
        }}
      />
    </>
  );
}
