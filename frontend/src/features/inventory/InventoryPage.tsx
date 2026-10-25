import { useQueryClient } from '@tanstack/react-query';
import {
  CarIcon,
  NoResultsIcon,
  PencilIcon,
  PlusIcon,
  RestockIcon,
  RetryIcon,
  TrashIcon,
} from '../../components/icons';
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
import { useAuth } from '../auth/authContext';
import { FilterBar } from './FilterBar';
import { PurchaseSheet } from './PurchaseSheet';
import { ResultsBar } from './ResultsBar';
import { VehicleCard } from './VehicleCard';
import { VehicleGridSkeleton } from './VehicleGridSkeleton';
import { DeleteVehicleDialog } from './admin/DeleteVehicleDialog';
import { RestockSheet } from './admin/RestockSheet';
import { VehicleFormSheet } from './admin/VehicleFormSheet';
import { useVehicles, vehicleKeys } from './useVehicles';

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/** The dashboard: every vehicle, with filters, sorting and purchasing (US-S3 to US-S6). */
export function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);
  const filtersValid = Object.keys(validateFilters(filters)).length === 0;
  const vehiclesQuery = useVehicles(filters, { enabled: filtersValid });
  const showSkeleton = useDelayedFlag(vehiclesQuery.isPending, 300);

  const isAdmin = useAuth().user?.role === 'ADMIN';

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  // Admin sheets: 'new' opens the add form; an id opens edit for that vehicle.
  const [editing, setEditing] = useState<string | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const setFilters = (next: Filters) => setSearchParams(toSearchParams(next), { replace: true });
  const clearFilters = () => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort });

  const vehicles = vehiclesQuery.data ? sortVehicles(vehiclesQuery.data, filters.sort) : null;
  const byId = (id: string | null) => vehicles?.find((vehicle) => vehicle.id === id) ?? null;
  const purchasing = byId(purchasingId);
  const editingVehicle = editing && editing !== 'new' ? byId(editing) : null;
  const restocking = byId(restockingId);

  const addButton = (
    <Button
      variant="secondary"
      icon={<PlusIcon aria-hidden="true" className="size-4" strokeWidth={2.25} />}
      onClick={() => setEditing('new')}
    >
      Add vehicle
    </Button>
  );

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-4">
        <h1 className="text-display wide font-bold tracking-tight sm:text-display wide">
          Inventory
        </h1>
        {isAdmin && addButton}
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
            icon={<RetryIcon className="size-6" aria-hidden="true" />}
            title="Couldn't load cars"
            description="Check your connection and try again."
            action={
              <Button
                variant="secondary"
                onClick={() => void vehiclesQuery.refetch()}
                loading={vehiclesQuery.isFetching}
              >
                Try again
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
              icon={<NoResultsIcon className="size-6" aria-hidden="true" />}
              title="No cars match these filters"
              description="Try a wider price range or a different category."
              action={<Button onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={<CarIcon className="size-6" aria-hidden="true" />}
              title="No cars in stock yet"
              description={isAdmin ? 'Add the first car to start selling.' : 'Check back soon.'}
              action={isAdmin ? addButton : undefined}
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
                {...(isAdmin && {
                  primaryAction:
                    vehicle.quantity === 0 ? (
                      <Button
                        fullWidth
                        icon={<RestockIcon aria-hidden="true" className="size-4" />}
                        aria-label={`Restock ${vehicle.make} ${vehicle.model}`}
                        onClick={() => setRestockingId(vehicle.id)}
                      >
                        Restock
                      </Button>
                    ) : undefined,
                  adminActions: (
                    <AdminActions
                      vehicle={vehicle}
                      showRestock={vehicle.quantity > 0}
                      onEdit={() => setEditing(vehicle.id)}
                      onRestock={() => setRestockingId(vehicle.id)}
                      onDelete={() => setDeleting(vehicle)}
                    />
                  ),
                })}
              />
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          <VehicleFormSheet
            open={editing !== null && (editing === 'new' || editingVehicle !== null)}
            vehicle={editingVehicle}
            onClose={() => setEditing(null)}
          />
          <RestockSheet vehicle={restocking} onClose={() => setRestockingId(null)} />
          <DeleteVehicleDialog vehicle={deleting} onClose={() => setDeleting(null)} />
        </>
      )}

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

/** Secondary admin controls under each card (US-A1). Names include the vehicle for screen readers. */
function AdminActions({
  vehicle,
  showRestock,
  onEdit,
  onRestock,
  onDelete,
}: {
  vehicle: Vehicle;
  showRestock: boolean;
  onEdit: () => void;
  onRestock: () => void;
  onDelete: () => void;
}) {
  const name = `${vehicle.make} ${vehicle.model}`;
  const icon = 'size-4';
  return (
    <div className="mt-3 -ml-2.5 flex gap-1">
      <Button
        variant="quiet"
        size="sm"
        aria-label={`Edit ${name}`}
        icon={<PencilIcon aria-hidden="true" className={icon} />}
        onClick={onEdit}
      >
        Edit
      </Button>
      {showRestock && (
        <Button
          variant="quiet"
          size="sm"
          aria-label={`Restock ${name}`}
          icon={<RestockIcon aria-hidden="true" className={icon} />}
          onClick={onRestock}
        >
          Restock
        </Button>
      )}
      <Button
        variant="quiet-danger"
        size="sm"
        aria-label={`Delete ${name}`}
        icon={<TrashIcon aria-hidden="true" className={icon} />}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}
