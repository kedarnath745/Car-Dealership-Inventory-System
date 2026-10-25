import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'filled' | 'tinted' | 'plain' | 'destructive' | 'destructive-plain';
export type ButtonSize = 'lg' | 'md' | 'sm';

const VARIANTS: Record<ButtonVariant, string> = {
  filled: 'bg-accent text-white hover:brightness-110 active:brightness-95',
  tinted: 'bg-accent-tint text-accent-text hover:brightness-[0.97] dark:hover:brightness-125',
  plain: 'text-accent-text hover:bg-surface-2',
  destructive: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  'destructive-plain': 'text-danger-text hover:bg-danger-tint',
};

/** Small buttons stay 32px tall visually but get a 44px touch target (HIG, WCAG 2.5.8). */
const SIZES: Record<ButtonSize, string> = {
  lg: 'h-[50px] px-5 text-headline',
  md: 'h-11 px-4 text-headline',
  sm: 'relative h-8 px-3 text-subhead before:absolute before:-inset-y-1.5 before:inset-x-0',
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
  variant = 'filled',
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
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none',
        'transition-[background-color,filter,transform] duration-100 ease-standard active:scale-[0.98]',
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
