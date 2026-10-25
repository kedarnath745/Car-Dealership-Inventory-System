import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { AppProviders, AppRoutes } from '../App';
import { TOKEN_STORAGE_KEY } from '../lib/api/tokenStore';

let lastLocation = '';

/** The URL (path + query) the app is currently showing, as a user would see in the address bar. */
export const currentUrl = () => lastLocation;

function LocationProbe() {
  const { pathname, search } = useLocation();
  lastLocation = pathname + search;
  return null;
}

/**
 * Renders the whole app (providers + routes) at a route, optionally signed in with a
 * stored token, the same way a returning user would arrive.
 */
export function renderApp(route = '/', { token }: { token?: string } = {}) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </AppProviders>,
  );
}
