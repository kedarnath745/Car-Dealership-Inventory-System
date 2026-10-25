import { CircleAlert } from 'lucide-react';
import { type InputHTMLAttributes, type ReactNode, type Ref, useId } from 'react';
import { cn } from '../../lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Content inside the field on the leading side, e.g. "₹" or a search icon. */
  leading?: ReactNode;
  /** Content inside the field on the trailing side, e.g. a Show button. */
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/** A text input with a visible label above it; errors and hints are linked for screen readers. */
export function TextField({
  label,
  hint,
  error,
  hideLabel = false,
  leading,
  trailing,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  // While an error is shown it replaces the hint, so the field never says two things at once.
  const showHint = Boolean(hint) && !error;
  const describedBy = error ? errorId : showHint ? hintId : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={cn('mb-1.5 block text-subhead font-medium text-label', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {leading && (
          <span className="pointer-events-none absolute left-3 flex items-center text-label-2">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-field border border-border-control bg-surface px-3 text-body text-label',
            'placeholder:text-label-3 transition-colors duration-200',
            'aria-invalid:border-danger-text aria-invalid:border-2',
            'disabled:cursor-not-allowed disabled:opacity-60',
            leading ? 'pl-9' : undefined,
            trailing ? 'pr-20' : undefined,
          )}
          {...rest}
        />
        {trailing && <div className="absolute right-1 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1 text-footnote text-danger-text">
          <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}
      {showHint && (
        <p id={hintId} className="mt-1.5 text-footnote text-label-2">
          {hint}
        </p>
      )}
    </div>
  );
}
