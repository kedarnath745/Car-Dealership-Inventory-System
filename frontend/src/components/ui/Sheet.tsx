import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
} from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

const FOCUSABLE =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Sticky action area (primary action on the trailing side). */
  footer?: ReactNode;
  /** When false (e.g. while saving), Escape, the backdrop and Cancel do nothing. */
  dismissible?: boolean;
  /** `alert` is a small centred confirmation (role="alertdialog") without the Cancel bar. */
  variant?: 'sheet' | 'alert';
}

/**
 * Modal sheet built on the native <dialog> element: the browser provides the top
 * layer, an inert background and Escape handling. Bottom sheet on phones, centred
 * dialog on wider screens. Focus moves to the element marked `data-autofocus` (or
 * the first control in the body) and returns to the trigger on close (WAI-ARIA APG).
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  variant = 'sheet',
}: SheetProps) {
  if (!open) return null;
  return (
    <SheetDialog
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      dismissible={dismissible}
      variant={variant}
    >
      {children}
    </SheetDialog>
  );
}

function SheetDialog({
  onClose,
  title,
  description,
  children,
  footer,
  dismissible,
  variant,
}: Omit<SheetProps, 'open'>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const target =
      dialog.querySelector<HTMLElement>('[data-autofocus]') ??
      bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      dialog;
    target.focus();
    return () => {
      if (dialog.open) dialog.close();
      trigger?.focus();
    };
  }, []);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  const handleCancel = (event: SyntheticEvent) => {
    event.preventDefault();
    requestClose();
  };

  // A click on the <dialog> element itself (not its content) is a click on the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) requestClose();
  };

  const isAlert = variant === 'alert';

  return (
    // The backdrop click is a pointer convenience; keyboard users close with Escape (onCancel).
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      role={isAlert ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cn('sheet', isAlert && 'sheet--alert')}
    >
      <div className="flex max-h-[inherit] flex-col">
        {isAlert ? (
          <div className="px-6 pt-6 text-center">
            <h2 id={titleId} className="text-title3 font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-callout text-label-2">
                {description}
              </p>
            )}
          </div>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-surface-3 sm:hidden"
            />
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-2 pb-1 sm:pt-3">
              <Button
                variant="plain"
                size="sm"
                onClick={requestClose}
                disabled={!dismissible}
                className="justify-self-start"
              >
                Cancel
              </Button>
              <h2 id={titleId} className="text-headline font-semibold">
                {title}
              </h2>
              <span />
            </header>
            {description && (
              <p id={descriptionId} className="px-5 pb-2 text-center text-subhead text-label-2">
                {description}
              </p>
            )}
          </>
        )}
        <div ref={bodyRef} className={cn('overflow-y-auto px-5', isAlert ? 'py-4' : 'py-3')}>
          {children}
        </div>
        {footer && (
          <footer className="border-t border-separator px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
