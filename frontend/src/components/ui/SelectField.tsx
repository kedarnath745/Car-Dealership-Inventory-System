import { CaretDownIcon } from '../icons';
import { type Ref, type SelectHTMLAttributes, useId } from 'react';
import { cn } from '../../lib/cn';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hideLabel?: boolean;
  options: ReadonlyArray<{ value: string; label: string }>;
  ref?: Ref<HTMLSelectElement>;
}

/** Native select (HIG pop-up button): phones show their own picker for free. */
export function SelectField({
  label,
  error,
  hideLabel = false,
  options,
  id,
  className,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className={cn('mb-1.5 block text-small font-medium text-ink', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-11 w-full cursor-pointer appearance-none rounded-md border border-line-strong bg-surface pr-10 pl-3 text-body text-ink',
            'aria-invalid:border-2 aria-invalid:border-danger',
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-2"
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-micro text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
