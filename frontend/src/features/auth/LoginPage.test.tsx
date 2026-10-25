import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import { TOKEN_STORAGE_KEY } from '../../lib/api/tokenStore';
import { TOKENS, apiError, meHandler, shopper } from '../../test/fixtures';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const vehiclesHandler = http.get('/api/vehicles', () => HttpResponse.json({ vehicles: [] }));

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(await screen.findByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
}

describe('Login page', () => {
  beforeEach(() => server.use(meHandler, vehiclesHandler));

  it('signs in, stores the token and opens the inventory', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ token: TOKENS.shopper, user: shopper }),
      ),
    );
    renderApp('/login');

    await fillAndSubmit('asha@example.com', 'correct horse battery');

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(TOKENS.shopper);
  });

  it('shows one clear message for wrong credentials, clears the password and focuses it', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        apiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
      ),
    );
    renderApp('/login');

    await fillAndSubmit('asha@example.com', 'wrong password!!');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "That email and password don't match. Check them and try again.",
    );
    expect(screen.getByLabelText('Email')).toHaveValue('asha@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveFocus();
  });

  it('shows the API message when sign-in is rate limited', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        apiError(
          429,
          'RATE_LIMITED',
          'Too many attempts. Please wait a few minutes and try again.',
        ),
      ),
    );
    renderApp('/login');

    await fillAndSubmit('asha@example.com', 'whatever-password');

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts');
  });

  it('validates on the client before sending anything', async () => {
    const login = vi.fn();
    server.use(http.post('/api/auth/login', login));
    renderApp('/login');

    await userEvent.click(await screen.findByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(login).not.toHaveBeenCalled();
  });

  it('disables the button and shows progress while signing in', async () => {
    server.use(
      http.post('/api/auth/login', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    renderApp('/login');

    await fillAndSubmit('asha@example.com', 'correct horse battery');

    expect(await screen.findByRole('button', { name: /Signing In…/ })).toBeDisabled();
  });

  it('links to registration', async () => {
    renderApp('/login');

    await userEvent.click(await screen.findByRole('link', { name: 'Create an account' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument(),
    );
  });
});
