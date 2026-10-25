import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../lib/api/endpoints';
import { ApiError, onSessionExpired } from '../../lib/api';
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

  // Restores a stored session. Only a 401 means the token is bad (and is handled by
  // onSessionExpired); a network or server error keeps the token so the user can retry.
  const [attempt, setAttempt] = useState(0);
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
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) endSession();
        else setStatus('unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, [endSession, attempt]);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((count) => count + 1);
  }, []);

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
      retry,
    }),
    [status, user, sessionExpired, startSession, endSession, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
