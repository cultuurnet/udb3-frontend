import { useEffect, useState } from 'react';
import { Breakpoints, theme } from '@/ui/theme';
import { useIsClient } from './useIsClient';
import type { Values } from '@/types/Values';

const useMatchBreakpoint = (breakpoint: Values<typeof Breakpoints>) => {
  const [matches, setMatches] = useState(false);
  const isClient = useIsClient();

  const handleChange = ({ matches }) => setMatches(matches);

  useEffect(() => {
    if (!breakpoint || !isClient) return;

    const mediaQuery = window.matchMedia(
      `(max-width: ${theme.breakpoints[breakpoint]}px)`,
    );

    mediaQuery.addEventListener('change', handleChange);

    // call once for initial render (when opening the page in mobile view)
    handleChange(mediaQuery);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint, isClient]);

  return matches;
};

export { useMatchBreakpoint };
