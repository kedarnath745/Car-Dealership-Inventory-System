import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/PasswordField';
import { TextField } from '../../components/ui/TextField';
import { ApiError } from '../../lib/api';
import { AuthLayout } from './AuthLayout';
import { useAuth } from './authContext';
import { MIN_PASSWORD_LENGTH, type RegisterValues, registerSchema } from './schemas';

const FIELDS = ['name', 'email', 'password'] as const;
const isField = (field: string): field is (typeof FIELDS)[number] =>
  (FIELDS as readonly string[]).includes(field);

export function RegisterPage() {
  const { register: createAccount } = useAuth();
  const [emailTaken, setEmailTaken] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setEmailTaken(false);
    try {
      const user = await createAccount(values);
      toast.success(`Welcome, ${user.name.split(' ')[0]}`);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setError('root', { message: 'Something went wrong. Please try again.' });
        return;
      }
      if (error.code === 'EMAIL_TAKEN') {
        setEmailTaken(true);
        setError(
          'email',
          { message: 'An account with this email already exists.' },
          { shouldFocus: true },
        );
        return;
      }
      const fieldErrors = (error.details ?? []).filter((detail) => isField(detail.field));
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          if (isField(field)) setError(field, { message });
        });
        return;
      }
      setError('root', { message: error.message });
    }
  });

  return (
    <AuthLayout
      title="Create account"
      subtitle="It takes a few seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {errors.root?.message && <Alert>{errors.root.message}</Alert>}
        <TextField
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            error={errors.email?.message}
            {...register('email')}
          />
          {emailTaken && (
            <Link
              to="/login"
              className="mt-1 inline-block text-footnote font-semibold text-accent-text hover:underline"
            >
              Sign in instead
            </Link>
          )}
        </div>
        <PasswordField
          label="Password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short phrase is easy to remember.`}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating Account…"
          className="mt-2"
        >
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
