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
  color: 'Abyss Black',
  year: 2025,
  createdAt: '2026-03-01T00:00:00.000Z',
});
const nexon = makeVehicle({
  make: 'Tata',
  model: 'Nexon EV',
  category: 'ELECTRIC',
  price: 1249000,
  quantity: 2,
  color: 'Pristine White',
  year: 2025,
  createdAt: '2026-02-01T00:00:00.000Z',
});
const verna = makeVehicle({
  make: 'Hyundai',
  model: 'Verna',
  category: 'SEDAN',
  price: 1099000,
  quantity: 0,
  color: 'Titan Grey',
  year: 2024,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const card = (name: string) => screen.getByRole('article', { name: new RegExp(`${name}$`) });
const cardTitles = () =>
  screen.getAllByRole('article').map((article) => within(article).getByRole('heading').textContent);

function setup(vehicles = [creta, nexon, verna]) {
  const mock = mockInventoryApi(vehicles);
  server.use(...mock.handlers);
  renderApp('/', { token: TOKENS.shopper });
  return mock;
}

describe('Inventory: browsing (US-S3)', () => {
  it('shows every vehicle, newest first, with a result count', async () => {
    setup();

    expect(await screen.findByText('3 cars')).toBeInTheDocument();
    expect(cardTitles()).toEqual([
      '2025 Hyundai Creta',
      '2025 Tata Nexon EV',
      '2024 Hyundai Verna',
    ]);
  });

  it('shows price in rupees, details and stock on each card', async () => {
    setup();

    const cretaCard = await screen.findByRole('article', { name: /Hyundai Creta$/ });
    expect(within(cretaCard).getByText('₹12,50,000')).toBeInTheDocument();
    expect(within(cretaCard).getByText('12.5 lakh')).toBeInTheDocument();
    expect(within(cretaCard).getByText('Abyss Black SUV')).toBeInTheDocument();
    expect(within(cretaCard).getByText('8 in stock')).toBeInTheDocument();
    expect(within(card('Tata Nexon EV')).getByText('Only 2 left')).toBeInTheDocument();
  });

  it('disables purchasing a sold-out vehicle and says why (F5)', async () => {
    setup();

    const vernaCard = await screen.findByRole('article', { name: /Hyundai Verna$/ });
    expect(within(vernaCard).getByRole('button', { name: 'Sold out' })).toBeDisabled();
    expect(within(vernaCard).queryByRole('button', { name: 'Purchase' })).not.toBeInTheDocument();
    expect(within(card('Hyundai Creta')).getByRole('button', { name: 'Purchase' })).toBeEnabled();
  });

  it('offers a retry when vehicles fail to load', async () => {
    let calls = 0;
    // Runtime handlers are matched in the order given, so the override goes first.
    server.use(
      http.get('/api/vehicles', () => {
        calls += 1;
        // The first request and the one automatic retry fail; Try Again then succeeds.
        return calls <= 2
          ? apiError(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong')
          : HttpResponse.json({ vehicles: [creta] });
      }),
      ...mockInventoryApi([]).handlers,
    );
    renderApp('/', { token: TOKENS.shopper });

    expect(
      await screen.findByText("Couldn't load cars", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('article', { name: /Hyundai Creta$/ })).toBeInTheDocument();
  });

  it('explains an empty showroom', async () => {
    setup([]);

    expect(await screen.findByText('No cars in stock yet')).toBeInTheDocument();
    expect(screen.getByText('Check back soon.')).toBeInTheDocument();
  });

  it('sends the user back to sign in when the session has expired', async () => {
    server.use(
      http.get('/api/vehicles', () => apiError(401, 'INVALID_TOKEN', 'Invalid or expired token')),
      ...mockInventoryApi([]).handlers,
    );
    renderApp('/', { token: TOKENS.shopper });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      screen.getByText('Your session has ended. Sign in again to continue.'),
    ).toBeInTheDocument();
  });
});

describe('Inventory: filtering and sorting (US-S4, US-S5)', () => {
  it('filters by category chip through the search endpoint', async () => {
    const mock = setup();
    await screen.findByText('3 cars');

    await userEvent.click(screen.getByRole('radio', { name: 'Electric' }));

    expect(await screen.findByText('1 car')).toBeInTheDocument();
    expect(cardTitles()).toEqual(['2025 Tata Nexon EV']);
    expect(mock.requests).toContain('/api/vehicles/search?category=ELECTRIC');
    expect(screen.getByRole('radio', { name: 'Electric' })).toBeChecked();
  });

  it('searches by make after the user stops typing', async () => {
    const mock = setup();
    await screen.findByText('3 cars');

    await userEvent.type(screen.getByLabelText('Make'), 'hyun');

    expect(await screen.findByText('2 cars')).toBeInTheDocument();
    expect(mock.requests.filter((r) => r.startsWith('/api/vehicles/search'))).toEqual([
      '/api/vehicles/search?make=hyun',
    ]);
  });

  it('applies filters from the URL, so filtered links can be shared', async () => {
    const mock = mockInventoryApi([creta, nexon, verna]);
    server.use(...mock.handlers);
    renderApp('/?category=SEDAN', { token: TOKENS.shopper });

    expect(await screen.findByText('1 car')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sedan' })).toBeChecked();
  });

  it('shows applied filters as removable chips and clears them all', async () => {
    setup();
    await screen.findByText('3 cars');
    await userEvent.click(screen.getByRole('radio', { name: 'SUV' }));
    await screen.findByText('1 car');

    await userEvent.click(screen.getByRole('button', { name: 'Remove filter: SUV' }));
    expect(await screen.findByText('3 cars')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Sedan' }));
    await screen.findByText('1 car');
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(await screen.findByText('3 cars')).toBeInTheDocument();
  });

  it('keeps what the user is typing when the page re-renders before it is applied', async () => {
    setup();
    await screen.findByText('3 cars');
    await userEvent.type(screen.getByLabelText('Make'), 'hy');
    await screen.findByText('2 cars');

    await userEvent.type(screen.getByLabelText('Make'), 'u');
    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'Price: Low to High');

    expect(screen.getByLabelText('Make')).toHaveValue('hyu');
  });

  it('opens a shared link with an inverted price range instead of hanging', async () => {
    const mock = mockInventoryApi([creta, nexon, verna]);
    server.use(...mock.handlers);
    renderApp('/?minPrice=1260000&maxPrice=1200000', { token: TOKENS.shopper });

    expect(await screen.findByText('2 cars')).toBeInTheDocument();
  });

  it('blocks an inverted price range without calling the API', async () => {
    const mock = setup();
    await screen.findByText('3 cars');

    await userEvent.type(screen.getByLabelText('Min price'), '2000000');
    await userEvent.type(screen.getByLabelText('Max price'), '1000000');

    expect(await screen.findByText('Min price must be less than max price')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(mock.requests.some((r) => r.includes('minPrice=2000000'))).toBe(false);
  });

  it('explains when no vehicle matches and offers to clear the filters', async () => {
    setup();
    await screen.findByText('3 cars');

    await userEvent.type(screen.getByLabelText('Make'), 'Ferrari');

    expect(await screen.findByText('No cars match these filters')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('3 cars')).toBeInTheDocument();
  });

  it('sorts by price', async () => {
    setup();
    await screen.findByText('3 cars');

    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'Price: Low to High');

    expect(cardTitles()).toEqual([
      '2024 Hyundai Verna',
      '2025 Tata Nexon EV',
      '2025 Hyundai Creta',
    ]);
  });
});

describe('Inventory: purchasing (US-S6)', () => {
  async function openPurchase(name: string) {
    await userEvent.click(
      within(await screen.findByRole('article', { name: new RegExp(`${name}$`) })).getByRole(
        'button',
        {
          name: 'Purchase',
        },
      ),
    );
    return screen.getByRole('dialog', { name: 'Confirm purchase' });
  }

  it('opens a confirmation sheet with a quantity stepper and a live total', async () => {
    setup();
    const sheet = await openPurchase('Tata Nexon EV');

    expect(within(sheet).getByText('2 available')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Buy for ₹12,49,000' })).toBeInTheDocument();

    await userEvent.click(within(sheet).getByRole('button', { name: 'Increase quantity' }));

    expect(within(sheet).getByRole('button', { name: 'Buy for ₹24,98,000' })).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });

  it('buys, updates the card from the response and confirms with a toast', async () => {
    setup();
    const sheet = await openPurchase('Hyundai Creta');
    await userEvent.click(within(sheet).getByRole('button', { name: 'Increase quantity' }));

    await userEvent.click(within(sheet).getByRole('button', { name: 'Buy for ₹25,00,000' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Bought 2 × Hyundai Creta')).toBeInTheDocument();
    expect(within(card('Hyundai Creta')).getByText('6 in stock')).toBeInTheDocument();
  });

  it('keeps the sheet open and explains when someone else bought the stock first', async () => {
    const mock = setup();
    const sheet = await openPurchase('Tata Nexon EV');
    await userEvent.click(within(sheet).getByRole('button', { name: 'Increase quantity' }));
    mock.setVehicles([creta, { ...nexon, quantity: 1 }, verna]);

    await userEvent.click(within(sheet).getByRole('button', { name: 'Buy for ₹24,98,000' }));

    expect(await within(sheet).findByRole('alert')).toHaveTextContent(
      'Only 1 left in stock. The quantity has been updated; check it and try again.',
    );
    expect(await within(sheet).findByText('1 available')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Buy for ₹12,49,000' })).toBeEnabled();
  });

  it('closes the sheet and explains when the vehicle no longer exists', async () => {
    const mock = setup();
    const sheet = await openPurchase('Hyundai Creta');
    mock.setVehicles([nexon, verna]);

    await userEvent.click(within(sheet).getByRole('button', { name: 'Buy for ₹12,50,000' }));

    expect(await screen.findByText('This vehicle is no longer available.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: /Hyundai Creta$/ })).not.toBeInTheDocument(),
    );
  });
});
