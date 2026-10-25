import { useLocation } from 'react-router';
import { recordLocation } from './location';

/** Renders nothing; records the router's current URL for `currentUrl()` in tests. */
export function LocationProbe() {
  const { pathname, search } = useLocation();
  recordLocation(pathname + search);
  return null;
}
