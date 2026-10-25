export const TOKEN_STORAGE_KEY = 'showroom.token';

/**
 * Where the access token lives between visits. localStorage is a documented
 * trade-off (DESIGN §5): simple Bearer auth across domains, at the cost of being
 * readable by injected scripts, which the app avoids by never rendering raw HTML.
 * Storage can throw (private mode, disabled storage), so every access is guarded.
 */
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // The session still works for this tab; it just won't survive a reload.
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
