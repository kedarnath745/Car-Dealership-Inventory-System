import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from './authContext';

interface FromState {
  from?: string;
}

function FullPageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center text-label-2" role="status">
      <Spinner className="size-6" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Pages for signed-in users. Visitors are sent to sign in and brought back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'guest') {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from } satisfies FromState} />;
  }
  return children;
}

/** Sign-in and registration: signed-in users go back to where they were heading. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') {
    const from = (location.state as FromState | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }
  return children;
}
