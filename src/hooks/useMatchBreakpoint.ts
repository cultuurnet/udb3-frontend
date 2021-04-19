import { useEffect, useState } from 'react';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/theme' or its correspondi... Remove this comment to see the full error message
import { theme } from '@/ui/theme';
import { useIsClient } from './useIsClient';

const useMatchBreakpoint = (breakpoint) => {
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
