import { useEffect, useState } from 'react';

/**
 * True only once `flag` has stayed true for `delayMs`. Used for loading skeletons, so
 * fast responses never flash a placeholder (NN/g: skeletons are for waits over ~300ms).
 */
export function useDelayedFlag(flag: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(timer);
  }, [flag, delayMs]);
  return delayed;
}
