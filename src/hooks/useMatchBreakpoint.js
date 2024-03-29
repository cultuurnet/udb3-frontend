import { useEffect, useState } from 'react';

import { Breakpoints, theme } from '@/ui/theme';

import { useIsClient } from './useIsClient';

const useMatchBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false);
  const isClient = useIsClient();

  const handleChange = ({ matches }) => setMatches(matches);

  useEffect(() => {
    if (typeof window === 'undefined' || !breakpoint || !isClient) return;

    const mediaQuery = window.matchMedia(
      `(${breakpoint === Breakpoints.XL ? 'min' : 'max'}-width: ${
        theme.breakpoints[breakpoint]
      }px)`,
    );

    if (!mediaQuery.addEventListener) {
      mediaQuery.addListener(handleChange);
    } else {
      mediaQuery.addEventListener('change', handleChange);
    }

    // call once for initial render (when opening the page in mobile view)
    handleChange(mediaQuery);

    return () => {
      if (!mediaQuery.removeEventListener) {
        mediaQuery.removeListener(handleChange);
      } else {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, [breakpoint, isClient]);

  return matches;
};

export { useMatchBreakpoint };
