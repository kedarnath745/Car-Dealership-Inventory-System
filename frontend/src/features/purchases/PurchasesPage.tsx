import { useQuery } from '@tanstack/react-query';
import { Receipt, RotateCw } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { purchasesApi } from '../../lib/api/endpoints';
import type { Purchase } from '../../lib/api/types';
import { formatDateTime, formatINR } from '../../lib/format';

/** The signed-in user's purchase history, newest first (US-S7). */
export function PurchasesPage() {
  const query = useQuery({ queryKey: ['purchases', 'me'], queryFn: purchasesApi.mine });
  const purchases = query.data;

  return (
    <>
      <header className="mb-5">
        <h1 className="text-title1 font-bold tracking-tight sm:text-large-title">My Purchases</h1>
        {purchases && purchases.length > 0 && <Summary purchases={purchases} />}
      </header>

      {query.isError && !purchases ? (
        <EmptyState
          icon={<RotateCw className="size-6" aria-hidden="true" />}
          title="Couldn't load your purchases"
          description="Check your connection and try again."
          action={
            <Button
              variant="tinted"
              loading={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Try Again
            </Button>
          }
        />
      ) : !purchases ? (
        <div className="grid place-items-center py-16 text-label-2" role="status">
          <Spinner className="size-6" />
          <span className="sr-only">Loading purchases…</span>
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-6" aria-hidden="true" />}
          title="No purchases yet"
          description="Vehicles you buy will appear here."
          action={
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-headline font-semibold text-white hover:brightness-110"
            >
              Browse Inventory
            </Link>
          }
        />
      ) : (
        <ul
          aria-label="Purchases"
          className="divide-y divide-separator overflow-hidden rounded-card bg-surface shadow-card"
        >
          {purchases.map((purchase) => (
            <PurchaseRow key={purchase.id} purchase={purchase} />
          ))}
        </ul>
      )}
    </>
  );
}

function Summary({ purchases }: { purchases: Purchase[] }) {
  const total = purchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  const count = purchases.length;
  return (
    <p className="mt-1 text-callout text-label-2 tabular-nums">
      {count} {count === 1 ? 'purchase' : 'purchases'} · {formatINR(total)} total
    </p>
  );
}

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  return (
    <li className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-headline font-semibold">
          <span>
            {purchase.make} {purchase.model} × {purchase.quantity}
          </span>
          {purchase.vehicleId === null && <Badge tone="neutral">No longer listed</Badge>}
        </p>
        <p className="mt-0.5 text-subhead text-label-2">
          <time dateTime={purchase.createdAt}>{formatDateTime(purchase.createdAt)}</time>
        </p>
      </div>
      <div className="text-right">
        <p className="text-headline font-semibold tabular-nums">{formatINR(purchase.totalPrice)}</p>
        <p className="text-footnote text-label-2 tabular-nums">
          {formatINR(purchase.unitPrice)} each
        </p>
      </div>
    </li>
  );
}
