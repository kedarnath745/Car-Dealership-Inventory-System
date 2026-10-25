import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Sheet } from './Sheet';

function Harness({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm purchase"
        dismissible={dismissible}
      >
        <button type="button">Inside</button>
      </Sheet>
    </>
  );
}

describe('Sheet', () => {
  it('renders nothing while closed', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a dialog named by its title and moves focus inside', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('dialog', { name: 'Confirm purchase' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes from its Cancel button', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cannot be dismissed while an action is pending', async () => {
    render(<Harness dismissible={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
