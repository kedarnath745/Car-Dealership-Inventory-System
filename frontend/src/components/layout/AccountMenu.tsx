import { LogOut } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../features/auth/authContext';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const ITEM =
  'flex h-11 w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 text-left text-body hover:bg-plate focus-visible:bg-plate';

/**
 * Account button with a small menu (WAI-ARIA menu button pattern): arrow keys move
 * between items, Escape closes and returns focus to the button.
 */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target))
        setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-plate sm:pr-3"
      >
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-plate text-micro font-semibold text-ink"
        >
          {initials(user.name)}
        </span>
        <span className="sr-only text-small font-medium sm:not-sr-only">{user.name}</span>
        {isAdmin && (
          <Badge tone="accent" className="sr-only sm:not-sr-only sm:h-6! sm:px-2!">
            Admin
          </Badge>
        )}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 mt-2 w-64 rounded-[16px] bg-surface p-1.5 shadow-overlay ring-1 ring-line"
        >
          <div className="px-3 py-2">
            <p className="text-small font-semibold">{user.name}</p>
            <p className="truncate text-micro text-ink-2">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            type="button"
            onClick={logout}
            className={cn(ITEM, 'text-danger')}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
