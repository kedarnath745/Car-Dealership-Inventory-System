import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TOKENS, makeVehicle } from '../../test/fixtures';
import { mockInventoryApi } from '../../test/inventoryApi';
import { renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const cheap = makeVehicle({ make: 'Maruti Suzuki', model: 'Swift', price: 649000 });
const pricey = makeVehicle({ make: 'BMW', model: 'M2', price: 10300000 });

function setup(route = '/') {
  const mock = mockInventoryApi([cheap, pricey]);
  server.use(...mock.handlers);
  renderApp(route, { token: TOKENS.shopper });
  return mock;
}

describe('compact price filter for small screens', () => {
  it('opens a Price sheet and applies the range on Show Results', async () => {
    setup();
    await screen.findByText('2 cars');

    await userEvent.click(screen.getByRole('button', { name: 'Price: Any' }));
    const sheet = screen.getByRole('dialog', { name: 'Price' });
    await userEvent.type(within(sheet).getByLabelText('Max price'), '1000000');
    await userEvent.click(within(sheet).getByRole('button', { name: 'Show results' }));

    expect(await screen.findByText('1 car')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Price: Up to ₹10,00,000' })).toBeInTheDocument();
  });

  it('will not apply an inverted range', async () => {
    setup();
    await screen.findByText('2 cars');
    await userEvent.click(screen.getByRole('button', { name: 'Price: Any' }));
    const sheet = screen.getByRole('dialog', { name: 'Price' });

    await userEvent.type(within(sheet).getByLabelText('Min price'), '900');
    await userEvent.type(within(sheet).getByLabelText('Max price'), '100');

    expect(within(sheet).getByText('Min price must be less than max price')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Show results' })).toBeDisabled();
  });

  it('Reset clears the price range', async () => {
    setup('/?minPrice=1000000');
    expect(await screen.findByText('1 car')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Price: From ₹10,00,000' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Reset' }),
    );

    expect(await screen.findByText('2 cars')).toBeInTheDocument();
  });
});

describe('tab bar for small screens', () => {
  it('links to the top-level sections and marks the current one', async () => {
    setup();
    await screen.findByText('2 cars');

    const tabs = screen.getByRole('navigation', { name: 'Tabs' });
    expect(within(tabs).getByRole('link', { name: 'Inventory' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(tabs).getByRole('link', { name: 'Purchases' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
