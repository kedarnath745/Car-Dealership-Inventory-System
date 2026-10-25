import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

/**
 * One shape (10px radius), four weights (visual identity D.7). The ink `primary`
 * appears at most once per view; repeated actions such as a card's Purchase are
 * `secondary`, so a grid of cars is not a wall of filled buttons.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'quiet-danger' | 'destructive';
export type ButtonSize = 'lg' | 'md' | 'sm';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-on-ink hover:opacity-90',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-plate',
  quiet: 'text-accent hover:bg-plate',
  'quiet-danger': 'text-danger hover:bg-danger-tint',
  destructive: 'bg-danger text-white hover:opacity-90 dark:bg-danger-tint dark:text-danger',
};

/** Small buttons stay 36px tall visually but get a 44px touch target (WCAG 2.5.8). */
const SIZES: Record<ButtonSize, string> = {
  lg: 'h-12 px-5 text-body font-semibold',
  md: 'h-11 px-4 text-body font-semibold',
  sm: 'relative h-9 px-2.5 text-small font-medium before:absolute before:-inset-y-1 before:inset-x-0',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button, marks it busy and shows a spinner (prevents double submits). */
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  fullWidth = false,
  icon,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md whitespace-nowrap select-none',
        'transition-[background-color,opacity,transform] duration-150 ease-standard active:scale-[0.985]',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
