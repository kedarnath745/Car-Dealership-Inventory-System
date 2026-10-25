import { CarIcon, ReceiptIcon } from '../icons';
import { Link, NavLink, Outlet } from 'react-router';
import { cn } from '../../lib/cn';
import { Wordmark } from '../Wordmark';
import { AccountMenu } from './AccountMenu';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-9 items-center rounded-md px-3 text-small font-medium transition-colors duration-150',
    isActive ? 'bg-plate text-ink' : 'text-ink-2 hover:text-ink',
  );

/** Layout for signed-in pages: translucent sticky bar (navigation layer) over the content. */
export function AppShell() {
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
          'border-line',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Showroom home" className="rounded-sm">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Inventory
            </NavLink>
            <NavLink to="/purchases" className={navLinkClass}>
              My purchases
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
        <CarIcon aria-hidden="true" className="size-6" strokeWidth={1.75} />
        Inventory
      </NavLink>
      <NavLink to="/purchases" className={tabClass}>
        <ReceiptIcon aria-hidden="true" className="size-6" strokeWidth={1.75} />
        Purchases
      </NavLink>
    </nav>
  );
}
