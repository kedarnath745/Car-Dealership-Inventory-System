import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/PasswordField';
import { TextField } from '../../components/ui/TextField';
import { ApiError } from '../../lib/api';
import { AuthLayout } from './AuthLayout';
import { useAuth } from './authContext';
import { type LoginValues, loginSchema } from './schemas';

const WRONG_CREDENTIALS = "That email and password don't match. Check them and try again.";

export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  // On success the GuestOnly guard sends the user on to where they were heading.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('root', { message: WRONG_CREDENTIALS });
        resetField('password');
        setFocus('password');
        return;
      }
      setError('root', {
        message:
          error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      });
    }
  });

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Browse and buy from our showroom."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {sessionExpired && !errors.root && (
          <Alert tone="info">Your session has ended. Sign in again to continue.</Alert>
        )}
        {errors.root?.message && <Alert>{errors.root.message}</Alert>}
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
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Signing in…"
          className="mt-2"
        >
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
