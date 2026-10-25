import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { TOKENS, apiError, makeVehicle } from '../../test/fixtures';
import { mockInventoryApi } from '../../test/inventoryApi';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const creta = makeVehicle({
  make: 'Hyundai',
  model: 'Creta',
  category: 'SUV',
  price: 1250000,
  quantity: 8,
  year: 2025,
  color: 'Abyss Black',
  createdAt: '2026-03-01T00:00:00.000Z',
});
const hilux = makeVehicle({
  make: 'Toyota',
  model: 'Hilux',
  category: 'TRUCK',
  price: 3040000,
  quantity: 0,
  year: 2024,
  color: 'Emotional Red',
  createdAt: '2026-02-01T00:00:00.000Z',
});

function setup(token: string = TOKENS.admin, vehicles = [creta, hilux]) {
  const mock = mockInventoryApi(vehicles);
  server.use(...mock.handlers);
  renderApp('/', { token });
  return mock;
}

const card = (name: string) => screen.getByRole('article', { name });

describe('admin controls visibility (US-A6, F6)', () => {
  it('hides every admin control from shoppers', async () => {
    setup(TOKENS.shopper);
    await screen.findByRole('article', { name: 'Hyundai Creta' });

    expect(screen.queryByRole('button', { name: 'Add Vehicle' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Restock / })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument();
  });

  it('shows the admin tools on every card for admins', async () => {
    setup();
    const cretaCard = await screen.findByRole('article', { name: 'Hyundai Creta' });

    expect(screen.getByRole('button', { name: 'Add Vehicle' })).toBeInTheDocument();
    expect(
      within(cretaCard).getByRole('button', { name: 'Edit Hyundai Creta' }),
    ).toBeInTheDocument();
    expect(
      within(cretaCard).getByRole('button', { name: 'Restock Hyundai Creta' }),
    ).toBeInTheDocument();
    expect(
      within(cretaCard).getByRole('button', { name: 'Delete Hyundai Creta' }),
    ).toBeInTheDocument();
  });

  it('makes Restock the main action on a sold-out card for admins', async () => {
    setup();
    const hiluxCard = await screen.findByRole('article', { name: 'Toyota Hilux' });

    expect(within(hiluxCard).queryByRole('button', { name: 'Sold out' })).not.toBeInTheDocument();
    expect(within(hiluxCard).getAllByRole('button', { name: /Restock/ })[0]).toBeEnabled();
  });
});

describe('adding a vehicle (US-A2)', () => {
  async function openAddSheet() {
    await userEvent.click(await screen.findByRole('button', { name: 'Add Vehicle' }));
    return screen.getByRole('dialog', { name: 'Add Vehicle' });
  }

  async function fillValidForm(sheet: HTMLElement) {
    const scope = within(sheet);
    await userEvent.type(scope.getByLabelText('Make'), 'Kia');
    await userEvent.type(scope.getByLabelText('Model'), 'Seltos');
    await userEvent.selectOptions(scope.getByLabelText('Category'), 'SUV');
    await userEvent.type(scope.getByLabelText('Year'), '2025');
    await userEvent.type(scope.getByLabelText('Colour'), 'Glacier White');
    await userEvent.type(scope.getByLabelText('Price'), '1099000');
    await userEvent.type(scope.getByLabelText('Initial stock'), '4');
  }

  it('creates the vehicle, shows it and confirms', async () => {
    let body: unknown;
    const mock = setup();
    server.use(
      http.post('/api/vehicles', async ({ request }) => {
        body = await request.clone().json();
        return undefined;
      }),
      ...mock.handlers,
    );
    const sheet = await openAddSheet();
    await fillValidForm(sheet);

    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Added Kia Seltos')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: 'Kia Seltos' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(body).toEqual({
      make: 'Kia',
      model: 'Seltos',
      category: 'SUV',
      year: 2025,
      color: 'Glacier White',
      price: 1099000,
      quantity: 4,
      imageUrl: null,
    });
  });

  it('validates every field before sending', async () => {
    const mock = setup();
    const sheet = await openAddSheet();

    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }));

    const scope = within(sheet);
    expect(await scope.findByText('Enter the make')).toBeInTheDocument();
    expect(scope.getByText('Enter the model')).toBeInTheDocument();
    expect(scope.getByText('Choose a category')).toBeInTheDocument();
    expect(scope.getByText('Enter the price in rupees')).toBeInTheDocument();
    expect(mock.requests).not.toContain('POST /api/vehicles');
  });

  it('rejects an image URL that is not http(s)', async () => {
    setup();
    const sheet = await openAddSheet();
    await fillValidForm(sheet);
    await userEvent.type(
      within(sheet).getByLabelText('Image URL (optional)'),
      'javascript:alert(1)',
    );

    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }));

    expect(
      await within(sheet).findByText('Enter a link starting with http:// or https://'),
    ).toBeInTheDocument();
  });

  it('shows server validation errors on the matching field', async () => {
    const mock = setup();
    server.use(
      http.post('/api/vehicles', () =>
        apiError(400, 'VALIDATION_ERROR', 'Request validation failed', [
          { field: 'price', message: 'Price is too large' },
        ]),
      ),
      ...mock.handlers,
    );
    const sheet = await openAddSheet();
    await fillValidForm(sheet);

    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }));

    expect(await within(sheet).findByLabelText('Price')).toHaveAccessibleDescription(
      'Price is too large',
    );
  });
});

describe('editing a vehicle (US-A3)', () => {
  it('edits details without a stock field and sends only what changed', async () => {
    let body: unknown;
    const mock = setup();
    server.use(
      http.put('/api/vehicles/:id', async ({ request }) => {
        body = await request.clone().json();
        return undefined;
      }),
      ...mock.handlers,
    );
    await userEvent.click(
      within(await screen.findByRole('article', { name: 'Hyundai Creta' })).getByRole('button', {
        name: 'Edit Hyundai Creta',
      }),
    );
    const sheet = screen.getByRole('dialog', { name: 'Edit Vehicle' });
    const scope = within(sheet);

    expect(scope.getByLabelText('Make')).toHaveValue('Hyundai');
    expect(scope.queryByLabelText('Initial stock')).not.toBeInTheDocument();
    expect(scope.getByText('Stock: 8 · use Restock to change')).toBeInTheDocument();
    expect(scope.getByRole('button', { name: 'Save' })).toBeDisabled();

    await userEvent.clear(scope.getByLabelText('Price'));
    await userEvent.type(scope.getByLabelText('Price'), '1199000');
    await userEvent.click(scope.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Saved Hyundai Creta')).toBeInTheDocument();
    expect(body).toEqual({ price: 1199000 });
    expect(within(card('Hyundai Creta')).getByText('₹11,99,000')).toBeInTheDocument();
  });
});

describe('restocking (US-A4)', () => {
  it('previews the new stock and updates the card', async () => {
    setup();
    await userEvent.click(
      within(await screen.findByRole('article', { name: 'Hyundai Creta' })).getByRole('button', {
        name: 'Restock Hyundai Creta',
      }),
    );
    const sheet = screen.getByRole('dialog', { name: 'Restock' });
    const units = within(sheet).getByLabelText('Units to add');

    await userEvent.clear(units);
    await userEvent.type(units, '5');

    expect(within(sheet).getByText('Stock after restock: 8 → 13')).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole('button', { name: 'Add 5 Units' }));

    expect(await screen.findByText('Restocked Hyundai Creta: 13 in stock')).toBeInTheDocument();
    expect(within(card('Hyundai Creta')).getByText('In stock · 13')).toBeInTheDocument();
  });
});

describe('deleting (US-A5)', () => {
  it('asks a specific question, defaults to Cancel and removes the card on confirm', async () => {
    const mock = setup();
    await userEvent.click(
      within(await screen.findByRole('article', { name: 'Hyundai Creta' })).getByRole('button', {
        name: 'Delete Hyundai Creta',
      }),
    );
    const alert = screen.getByRole('alertdialog', { name: 'Delete 2025 Hyundai Creta?' });

    expect(alert).toHaveAccessibleDescription(
      'It will be removed from inventory. Past purchases stay in purchase history.',
    );
    expect(within(alert).getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await userEvent.click(within(alert).getByRole('button', { name: 'Delete Vehicle' }));

    expect(await screen.findByText('Deleted Hyundai Creta')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Hyundai Creta' })).not.toBeInTheDocument(),
    );
    expect(mock.requests).toContain(`DELETE /api/vehicles/${creta.id}`);
  });

  it('cancelling keeps the vehicle', async () => {
    const mock = setup();
    await userEvent.click(
      within(await screen.findByRole('article', { name: 'Hyundai Creta' })).getByRole('button', {
        name: 'Delete Hyundai Creta',
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(card('Hyundai Creta')).toBeInTheDocument();
    expect(mock.requests.some((r) => r.startsWith('DELETE'))).toBe(false);
  });
});

describe('admin empty state', () => {
  it('invites the admin to add the first vehicle', async () => {
    setup(TOKENS.admin, []);

    expect(await screen.findByText('No vehicles yet')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add Vehicle' }).length).toBeGreaterThan(1);
  });
});

// Keeps HttpResponse import used for handler typing in overrides above.
void HttpResponse;
