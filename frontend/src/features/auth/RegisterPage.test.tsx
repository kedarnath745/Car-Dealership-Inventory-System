import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { TOKENS, apiError, meHandler, shopper } from '../../test/fixtures';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

async function fillForm(name: string, email: string, password: string) {
  await userEvent.type(await screen.findByLabelText('Name'), name);
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
}

describe('Register page', () => {
  beforeEach(() =>
    server.use(
      meHandler,
      http.get('/api/vehicles', () => HttpResponse.json({ vehicles: [] })),
    ),
  );

  it('explains the 15-character password rule up front', async () => {
    renderApp('/register');

    expect(await screen.findByLabelText('Password')).toHaveAccessibleDescription(
      'At least 15 characters. A short phrase is easy to remember.',
    );
  });

  it('creates the account, signs in and welcomes the user by first name', async () => {
    let body: unknown;
    server.use(
      http.post('/api/auth/register', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: TOKENS.shopper, user: shopper }, { status: 201 });
      }),
    );
    renderApp('/register');

    await fillForm('Asha Rao', 'asha@example.com', 'correct horse battery');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(await screen.findByText('Welcome, Asha')).toBeInTheDocument();
    expect(body).toEqual({
      name: 'Asha Rao',
      email: 'asha@example.com',
      password: 'correct horse battery',
    });
  });

  it('rejects a short password on the client without calling the API', async () => {
    const register = vi.fn();
    server.use(http.post('/api/auth/register', register));
    renderApp('/register');

    await fillForm('Asha Rao', 'asha@example.com', 'short pass');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Password must be at least 15 characters')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('explains a taken email under the field and offers to sign in instead', async () => {
    server.use(
      http.post('/api/auth/register', () =>
        apiError(409, 'EMAIL_TAKEN', 'An account with this email already exists'),
      ),
    );
    renderApp('/register');

    await fillForm('Asha Rao', 'asha@example.com', 'correct horse battery');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByLabelText('Email')).toHaveAccessibleDescription(
      'An account with this email already exists.',
    );
    expect(screen.getByRole('link', { name: 'Sign in instead' })).toHaveAttribute('href', '/login');
  });

  it('maps server validation details onto the matching fields', async () => {
    server.use(
      http.post('/api/auth/register', () =>
        apiError(400, 'VALIDATION_ERROR', 'Request validation failed', [
          { field: 'name', message: 'Name must be at most 60 characters' },
        ]),
      ),
    );
    renderApp('/register');

    await fillForm('Asha Rao', 'asha@example.com', 'correct horse battery');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByLabelText('Name')).toHaveAccessibleDescription(
      'Name must be at most 60 characters',
    );
  });
});
