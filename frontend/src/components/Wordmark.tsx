import { CarFront } from 'lucide-react';
import { cn } from '../lib/cn';

/** The Showroom wordmark: our own name and a generic icon, no third-party marks (D33). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-body font-semibold', className)}>
      <span className="grid size-8 place-items-center rounded-[9px] bg-accent text-white">
        <CarFront aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>
      Showroom
    </span>
  );
}
