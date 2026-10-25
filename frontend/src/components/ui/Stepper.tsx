import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../lib/cn';

const STEP_BUTTON =
  'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-label shadow-card transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100';

/** − value + control with 44px buttons; typing a number is also allowed and is clamped. */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  initialFocus = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Marks the input as the first thing focused when a sheet opens (dialog pattern). */
  initialFocus?: boolean;
}) {
  const id = useId();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="flex items-center gap-2" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={STEP_BUTTON}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        data-autofocus={initialFocus || undefined}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(next)) onChange(clamp(next));
        }}
        className={cn(
          'h-11 w-16 rounded-field border border-border-control bg-surface text-center text-body font-semibold tabular-nums',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        className={STEP_BUTTON}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
