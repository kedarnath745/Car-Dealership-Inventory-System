import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { TOKEN_STORAGE_KEY } from '../../lib/api/tokenStore';
import { TOKENS, meHandler } from '../../test/fixtures';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

describe('session and route guards', () => {
  beforeEach(() =>
    server.use(
      meHandler,
      http.get('/api/vehicles', () => HttpResponse.json({ vehicles: [] })),
    ),
  );

  it('sends signed-out visitors to the sign-in page', async () => {
    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('restores a stored session and shows who is signed in', async () => {
    renderApp('/', { token: TOKENS.shopper });

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asha Rao/ })).toBeInTheDocument();
  });

  it('marks administrators with an Admin badge', async () => {
    renderApp('/', { token: TOKENS.admin });

    const account = await screen.findByRole('button', { name: /Ritu Admin/ });
    expect(within(account).getByText('Admin')).toBeInTheDocument();
  });

  it('discards an invalid stored token and asks the user to sign in', async () => {
    renderApp('/', { token: 'stale-token' });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('keeps signed-in users away from the sign-in page', async () => {
    renderApp('/login', { token: TOKENS.shopper });

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
  });

  it('signs out from the account menu', async () => {
    renderApp('/', { token: TOKENS.shopper });

    await userEvent.click(await screen.findByRole('button', { name: /Asha Rao/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('keeps the session when the server cannot be reached at start-up, and retries', async () => {
    server.use(http.get('/api/auth/me', () => HttpResponse.error()));
    renderApp('/', { token: TOKENS.shopper });

    expect(await screen.findByText("Couldn't reach Showroom")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(TOKENS.shopper);

    server.use(meHandler);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
  });
});
