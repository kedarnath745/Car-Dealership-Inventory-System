import { cn } from '../lib/cn';

/** The Showroom wordmark: the name itself, set extra wide (visual identity D.12). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-[1.1875rem] font-bold tracking-[-0.01em] text-ink [font-stretch:125%]',
        className,
      )}
    >
      Showroom
    </span>
  );
}
