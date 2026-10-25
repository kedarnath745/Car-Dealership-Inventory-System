import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import type { Purchase } from '../../lib/api/types';
import { TOKENS, apiError, meHandler } from '../../test/fixtures';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const purchases: Purchase[] = [
  {
    id: 'p-2',
    vehicleId: 'v-1',
    make: 'Hyundai',
    model: 'Creta',
    quantity: 2,
    unitPrice: 1110900,
    totalPrice: 2221800,
    createdAt: '2026-10-25T10:12:00.000Z',
  },
  {
    id: 'p-1',
    vehicleId: null,
    make: 'MG',
    model: 'ZS EV',
    quantity: 1,
    unitPrice: 1898000,
    totalPrice: 1898000,
    createdAt: '2026-10-20T04:30:00.000Z',
  },
];

function setup(response: () => Response) {
  server.use(
    meHandler,
    http.get('/api/purchases/me', response),
    http.get('/api/vehicles', () => HttpResponse.json({ vehicles: [] })),
  );
  renderApp('/purchases', { token: TOKENS.shopper });
}

describe('My Purchases (US-S7)', () => {
  it('lists purchases newest first with quantity, date and total', async () => {
    setup(() => HttpResponse.json({ purchases }));

    expect(await screen.findByRole('heading', { name: 'My purchases' })).toBeInTheDocument();
    const rows = within(await screen.findByRole('list', { name: 'Purchases' })).getAllByRole(
      'listitem',
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Hyundai Creta × 2');
    expect(rows[0]).toHaveTextContent(/25 Oct 2026, 3:42\s?pm/i);
    expect(rows[0]).toHaveTextContent('₹22,21,800');
    expect(rows[0]).toHaveTextContent('₹11,10,900 each');
  });

  it('summarises the number of purchases and the amount spent', async () => {
    setup(() => HttpResponse.json({ purchases }));

    expect(await screen.findByText('2 purchases, ₹41,19,800 in total')).toBeInTheDocument();
  });

  it('keeps purchases of vehicles that were removed, marked as no longer listed (D7)', async () => {
    setup(() => HttpResponse.json({ purchases }));

    const rows = await screen.findAllByRole('listitem');
    expect(within(rows[1]!).getByText('No longer listed')).toBeInTheDocument();
    expect(within(rows[0]!).queryByText('No longer listed')).not.toBeInTheDocument();
  });

  it('explains an empty history and links back to the inventory', async () => {
    setup(() => HttpResponse.json({ purchases: [] }));

    expect(await screen.findByText('No purchases yet')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Browse inventory' }));
    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
  });

  it('offers a retry when the history fails to load', async () => {
    let calls = 0;
    setup(() => {
      calls += 1;
      return calls <= 2
        ? apiError(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong')
        : HttpResponse.json({ purchases });
    });

    expect(
      await screen.findByText("Couldn't load your purchases", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('2 purchases, ₹41,19,800 in total')).toBeInTheDocument();
  });
});
