import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Stepper } from './Stepper';

function Harness({ initial, max }: { initial: number; max: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <Stepper label="Quantity" value={value} min={1} max={max} onChange={setValue} />
      <output>{value}</output>
    </>
  );
}

describe('Stepper', () => {
  it('shows the clamped value at once when a number above the maximum is typed', async () => {
    render(<Harness initial={3} max={3} />);
    const input = screen.getByLabelText('Quantity');

    await userEvent.clear(input);
    await userEvent.type(input, '9');

    expect(input).toHaveValue('3');
    expect(screen.getByRole('status')).toHaveTextContent('3');
  });

  it('accepts a typed value within range', async () => {
    render(<Harness initial={1} max={10} />);
    const input = screen.getByLabelText('Quantity');

    await userEvent.clear(input);
    await userEvent.type(input, '7');

    expect(input).toHaveValue('7');
    expect(screen.getByRole('status')).toHaveTextContent('7');
  });
});
