import getConfig from 'next/config';
import { useCallback, useMemo } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

const useConsoleDebugger = () => {
  /* eslint-disable no-console */
  const [showDebugging] = useFeatureFlag(FeatureFlags.SHOW_CONSOLE_DEBUGGING);

  const { publicRuntimeConfig } = getConfig() || {};
  const isDevelopment = publicRuntimeConfig?.environment === 'development';

  const shouldLog = useMemo(() => {
    return isDevelopment || showDebugging;
  }, [isDevelopment, showDebugging]);

  const log = useCallback(
    (...args: unknown[]) => {
      if (shouldLog) {
        console.log(...args);
      }
    },
    [shouldLog],
  );

  const info = useCallback(
    (...args: unknown[]) => {
      if (shouldLog) {
        console.info(...args);
      }
    },
    [shouldLog],
  );

  const debug = useCallback(
    (...args: unknown[]) => {
      if (shouldLog) {
        console.debug(...args);
      }
    },
    [shouldLog],
  );

  const error = useCallback(
    (...args: unknown[]) => {
      if (shouldLog) {
        console.error(...args);
      }
    },
    [shouldLog],
  );

  return {
    log,
    info,
    debug,
    error,
  };
};

export { useConsoleDebugger };
