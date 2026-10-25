import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TextField } from '../../components/ui/TextField';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { CATEGORIES, type Category } from '../../lib/api/types';
import { cn } from '../../lib/cn';
import { type Filters, activeFilterChips, validateFilters } from '../../lib/filters';
import { categoryLabel } from '../../lib/format';
import { PriceSheet } from './PriceSheet';

type TextDraft = Pick<Filters, 'make' | 'model' | 'minPrice' | 'maxPrice'>;

const draftOf = ({ make, model, minPrice, maxPrice }: Filters): TextDraft => ({
  make,
  model,
  minPrice,
  maxPrice,
});
const sameDraft = (a: TextDraft, b: TextDraft) =>
  a.make === b.make &&
  a.model === b.model &&
  a.minPrice === b.minPrice &&
  a.maxPrice === b.maxPrice;

/** Only digits survive in price fields, so "12,50,000" pasted from elsewhere still works. */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

/**
 * Make, model, price range and category. Text fields apply 300ms after typing stops;
 * category chips apply at once. An invalid price range is shown inline and never sent.
 */
export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const [draft, setDraft] = useState<TextDraft>(() => draftOf(filters));
  const debouncedDraft = useDebouncedValue(draft, 300);
  const applied = useMemo(() => draftOf(filters), [filters]);

  // Outside changes (Clear All, removing a chip, Back button) reset the inputs.
  useEffect(() => {
    setDraft((current) => (sameDraft(current, applied) ? current : applied));
  }, [applied]);

  const errors = validateFilters({ ...filters, ...draft });

  useEffect(() => {
    if (sameDraft(debouncedDraft, applied)) return;
    if (Object.keys(validateFilters({ ...filters, ...debouncedDraft })).length > 0) return;
    onChange({ ...filters, ...debouncedDraft });
    // Only a settled draft should trigger a change; filters/onChange are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  const setField = (key: keyof TextDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const selectCategory = (category: Category | '') => onChange({ ...filters, category });

  // Small screens: the price range lives in a sheet behind a button that shows the range.
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);
  const priceSummary =
    activeFilterChips(filters).find((chip) => chip.key === 'price')?.label ?? 'Any';

  return (
    <section aria-label="Filters" className="rounded-lg bg-surface p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_160px_160px]">
        <TextField
          label="Make"
          placeholder="Any"
          type="search"
          enterKeyHint="search"
          leading={<Search className="size-4" aria-hidden="true" />}
          value={draft.make}
          onChange={(event) => setField('make', event.target.value)}
        />
        <TextField
          label="Model"
          placeholder="Any"
          type="search"
          enterKeyHint="search"
          leading={<Search className="size-4" aria-hidden="true" />}
          value={draft.model}
          onChange={(event) => setField('model', event.target.value)}
        />
        <button
          type="button"
          onClick={() => setPriceSheetOpen(true)}
          className="col-span-2 flex h-11 cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-left text-body md:hidden"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4 text-ink-2" />
          <span className="text-ink-2">Price:</span>
          <span className="truncate font-medium">{priceSummary}</span>
        </button>
        <TextField
          label="Min price"
          className="hidden md:block"
          placeholder="Any"
          inputMode="numeric"
          leading="₹"
          value={draft.minPrice}
          error={errors.minPrice}
          onChange={(event) => setField('minPrice', digitsOnly(event.target.value))}
        />
        <TextField
          label="Max price"
          className="hidden md:block"
          placeholder="Any"
          inputMode="numeric"
          leading="₹"
          value={draft.maxPrice}
          error={errors.maxPrice}
          onChange={(event) => setField('maxPrice', digitsOnly(event.target.value))}
        />
      </div>
      <CategoryChips value={filters.category} onChange={selectCategory} />
      <PriceSheet
        open={priceSheetOpen}
        filters={filters}
        onClose={() => setPriceSheetOpen(false)}
        onApply={(range) => {
          setPriceSheetOpen(false);
          onChange({ ...filters, ...range });
        }}
      />
    </section>
  );
}

/** Single-select chip row (D32): a radio group, so arrow keys move between options. */
function CategoryChips({
  value,
  onChange,
}: {
  value: Category | '';
  onChange: (value: Category | '') => void;
}) {
  const options: Array<{ value: Category | ''; label: string }> = [
    { value: '', label: 'All' },
    ...CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })),
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Category"
      className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:-mx-4 sm:px-4"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.label}
            className={cn(
              'relative flex h-9 shrink-0 cursor-pointer items-center rounded-full px-3.5 text-small font-medium transition-colors duration-200',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
              checked ? 'bg-accent text-white' : 'bg-plate text-ink hover:bg-plate',
            )}
          >
            <input
              type="radio"
              name="category"
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
