import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { TextField } from '../../components/ui/TextField';
import { type Filters, validateFilters } from '../../lib/filters';

const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** Price range in a bottom sheet for small screens; nothing applies until Show Results. */
export function PriceSheet({
  open,
  filters,
  onApply,
  onClose,
}: {
  open: boolean;
  filters: Filters;
  onApply: (range: Pick<Filters, 'minPrice' | 'maxPrice'>) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Price">
      {open && <PriceForm filters={filters} onApply={onApply} />}
    </Sheet>
  );
}

function PriceForm({
  filters,
  onApply,
}: {
  filters: Filters;
  onApply: (range: Pick<Filters, 'minPrice' | 'maxPrice'>) => void;
}) {
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const errors = validateFilters({ ...filters, minPrice, maxPrice });
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Min price"
          placeholder="Any"
          inputMode="numeric"
          leading="₹"
          value={minPrice}
          error={errors.minPrice}
          onChange={(event) => setMinPrice(digitsOnly(event.target.value))}
        />
        <TextField
          label="Max price"
          placeholder="Any"
          inputMode="numeric"
          leading="₹"
          value={maxPrice}
          error={errors.maxPrice}
          onChange={(event) => setMaxPrice(digitsOnly(event.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="plain" onClick={() => onApply({ minPrice: '', maxPrice: '' })}>
          Reset
        </Button>
        <Button
          fullWidth
          size="lg"
          disabled={hasErrors}
          onClick={() => onApply({ minPrice, maxPrice })}
        >
          Show Results
        </Button>
      </div>
    </div>
  );
}
