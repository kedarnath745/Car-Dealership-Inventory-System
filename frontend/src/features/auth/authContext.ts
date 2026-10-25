import { createContext, useContext } from 'react';
import type { User } from '../../lib/api/types';

/** `unreachable`: a stored session exists but the server could not be reached to confirm it. */
export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'unreachable';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** True after the server rejected the session, so sign-in can explain why. */
  sessionExpired: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  /** Tries again to restore a stored session after the server was unreachable. */
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** The signed-in user and auth actions. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
