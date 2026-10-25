import { MinusIcon, PlusIcon } from '../icons';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

const STEP_BUTTON =
  'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-ink transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100';

/**
 * − value + control with 44px buttons. Typing is allowed too: the field keeps what
 * the user types (even briefly empty) and reports a clamped number when it is valid.
 */
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
  const [text, setText] = useState(String(value));
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  // Keep the field in sync when the value changes from outside (buttons, clamping).
  useEffect(() => {
    setText((current) => (Number(current) === value ? current : String(value)));
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={STEP_BUTTON}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <MinusIcon aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        data-autofocus={initialFocus || undefined}
        value={text}
        disabled={disabled}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '');
          setText(digits);
          if (digits !== '') onChange(clamp(Number.parseInt(digits, 10)));
        }}
        onBlur={() => setText(String(value))}
        className={cn(
          'h-11 w-20 rounded-md border border-line-strong bg-surface text-center text-body font-semibold tabular-nums',
        )}
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        className={STEP_BUTTON}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <PlusIcon aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
