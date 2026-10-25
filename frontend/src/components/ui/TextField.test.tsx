import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordField } from './PasswordField';
import { TextField } from './TextField';

describe('TextField', () => {
  it('links its visible label to the input', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('describes the input with its hint', () => {
    render(<TextField label="Price" hint="In rupees" />);
    expect(screen.getByLabelText('Price')).toHaveAccessibleDescription('In rupees');
  });

  it('marks the input invalid and announces the error', () => {
    render(<TextField label="Email" error="Enter a valid email" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email');
  });

  it('is not marked invalid without an error', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });
});

describe('PasswordField', () => {
  it('hides the password until Show is pressed', async () => {
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('TextField hint and error', () => {
  it('shows the error instead of the hint, never both', () => {
    render(<TextField label="Password" hint="At least 15 characters" error="Too short" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAccessibleDescription('Too short');
    expect(screen.queryByText('At least 15 characters')).not.toBeInTheDocument();
  });
});
