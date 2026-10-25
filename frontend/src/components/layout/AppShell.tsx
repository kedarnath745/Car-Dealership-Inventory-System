import { CarFront, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { cn } from '../../lib/cn';
import { Wordmark } from '../Wordmark';
import { AccountMenu } from './AccountMenu';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-9 items-center rounded-full px-3.5 text-small font-medium transition-colors duration-200',
    isActive ? 'bg-plate text-ink' : 'text-ink-2 hover:text-ink',
  );

/** Layout for signed-in pages: translucent sticky bar (navigation layer) over the content. */
export function AppShell() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-overlay"
      >
        Skip to content
      </a>
      <header
        className={cn(
          'material-bar sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-colors duration-200',
          scrolled ? 'border-line' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Showroom home" className="rounded-[10px]">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Inventory
            </NavLink>
            <NavLink to="/purchases" className={navLinkClass}>
              My Purchases
            </NavLink>
          </nav>
          <div className="ml-auto">
            <AccountMenu />
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[1280px] px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+6rem)] outline-none sm:px-6 md:pb-12 lg:px-8"
      >
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-1 flex-col items-center justify-center gap-0.5 text-micro font-medium transition-colors duration-200',
    isActive ? 'text-accent' : 'text-ink-2',
  );

/** Bottom tab bar on small screens: HIG pattern for top-level sections (Should tier). */
function TabBar() {
  return (
    <nav
      aria-label="Tabs"
      className="material-bar fixed inset-x-0 bottom-0 z-40 flex h-[calc(56px+env(safe-area-inset-bottom))] border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <NavLink to="/" end className={tabClass}>
        <CarFront aria-hidden="true" className="size-6" strokeWidth={1.75} />
        Inventory
      </NavLink>
      <NavLink to="/purchases" className={tabClass}>
        <Receipt aria-hidden="true" className="size-6" strokeWidth={1.75} />
        Purchases
      </NavLink>
    </nav>
  );
}
