import { createContext, useContext } from 'react';
import type { User } from '../../lib/api/types';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** True after the server rejected the session, so sign-in can explain why. */
  sessionExpired: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** The signed-in user and auth actions. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
