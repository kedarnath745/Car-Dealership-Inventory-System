import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import {
  type FilterKey,
  type Filters,
  SORT_OPTIONS,
  type SortOption,
  activeFilterChips,
} from '../../lib/filters';

/** Result count (announced politely), applied-filter chips, Clear All and Sort. */
export function ResultsBar({
  filters,
  count,
  onRemove,
  onClearAll,
  onSortChange,
}: {
  filters: Filters;
  count: number | null;
  onRemove: (key: FilterKey) => void;
  onClearAll: () => void;
  onSortChange: (sort: SortOption) => void;
}) {
  const chips = activeFilterChips(filters);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <p aria-live="polite" className="mr-1 text-small font-medium text-ink-2 tabular-nums">
        {count === null ? '' : `${count} ${count === 1 ? 'car' : 'cars'}`}
      </p>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex h-8 items-center gap-1 rounded-sm bg-accent-tint pr-1 pl-2.5 text-small font-medium text-accent"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={() => onRemove(chip.key)}
            className="grid size-6 cursor-pointer place-items-center rounded-sm hover:bg-accent/15"
          >
            <X aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {chips.length > 0 && (
        <Button variant="quiet" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      )}
      <SelectField
        label="Sort by"
        hideLabel
        className="ml-auto w-[13.5rem]"
        options={SORT_OPTIONS}
        value={filters.sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
      />
    </div>
  );
}
