import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppProviders, AppRoutes } from '../App';
import { TOKEN_STORAGE_KEY } from '../lib/api/tokenStore';
import { LocationProbe } from './LocationProbe';

export { currentUrl } from './location';

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
