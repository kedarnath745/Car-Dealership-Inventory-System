import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../lib/api/endpoints';
import { onSessionExpired } from '../../lib/api';
import { tokenStore } from '../../lib/api/tokenStore';
import type { AuthResponse, User } from '../../lib/api/types';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

/**
 * Owns the signed-in user. On start it restores a stored token by asking the API
 * who it belongs to (GET /api/auth/me); any later 401 ends the session everywhere.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStore.get() ? 'loading' : 'guest'));
  const [sessionExpired, setSessionExpired] = useState(false);

  const endSession = useCallback(() => {
    tokenStore.clear();
    queryClient.clear();
    setUser(null);
    setStatus('guest');
  }, [queryClient]);

  useEffect(() => {
    if (!tokenStore.get()) return;
    let cancelled = false;
    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) endSession();
      });
    return () => {
      cancelled = true;
    };
  }, [endSession]);

  useEffect(
    () =>
      onSessionExpired(() => {
        endSession();
        setSessionExpired(true);
      }),
    [endSession],
  );

  const startSession = useCallback(({ token, user: signedIn }: AuthResponse) => {
    tokenStore.set(token);
    setUser(signedIn);
    setStatus('authenticated');
    setSessionExpired(false);
    return signedIn;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      sessionExpired,
      login: (input) => authApi.login(input).then(startSession),
      register: (input) => authApi.register(input).then(startSession),
      logout: endSession,
    }),
    [status, user, sessionExpired, startSession, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
