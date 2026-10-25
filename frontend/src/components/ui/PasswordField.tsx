import { useId, useState } from 'react';
import { TextField, type TextFieldProps } from './TextField';

/** Password input with a Show/Hide toggle (NIST SP 800-63B-4: offer to display the password). */
export function PasswordField({ id, ...rest }: Omit<TextFieldProps, 'type' | 'trailing'>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={inputId}
      type={visible ? 'text' : 'password'}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={() => setVisible((v) => !v)}
          className="h-9 cursor-pointer rounded-full px-3 text-subhead font-semibold text-accent-text hover:bg-surface-2"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      }
      {...rest}
    />
  );
}
