import { createApiClient } from './client';
import { tokenStore } from './tokenStore';

type Listener = () => void;
const sessionExpiredListeners = new Set<Listener>();

/** Subscribe to "the server rejected our token" (expired or revoked session). */
export function onSessionExpired(listener: Listener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

/**
 * The app's API client. In development VITE_API_URL is empty and requests go to the
 * same origin, where Vite proxies /api to the backend.
 */
export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL || window.location.origin,
  getToken: tokenStore.get,
  onUnauthorized: () => sessionExpiredListeners.forEach((listener) => listener()),
});

export { ApiError } from './client';
