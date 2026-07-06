import getConfig from 'next/config';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import type { Values } from '@/types/Values';

import { useCookiesWithOptions } from './useCookiesWithOptions';

const FeatureFlags = {
  REACT_CREATE: 'react_create',
  REACT_DUPLICATE: 'react_duplicate',
  SHOW_CONSOLE_DEBUGGING: 'show_console_debugging',
  SHOW_IFRAME_BORDER: 'show_iframe_border',
  BOA: 'boa',
  SHADCN_MIGRATION: 'shadcn_migration',
} as const;

const createCookieName = (identifier: string) => `ff_${identifier}`;

type FeatureFlagName = Values<typeof FeatureFlags>;

const useFeatureFlag = (featureFlagName: FeatureFlagName) => {
  const cookieName = useMemo(
    () => createCookieName(featureFlagName),
    [featureFlagName],
  );

  const dependencies = useMemo(() => [cookieName], [cookieName]);

  const { cookies, setCookie, removeCookie } =
    useCookiesWithOptions(dependencies);

  const isEnabled = useMemo(
    () =>
      isFeatureFlagEnabledInEnv(featureFlagName) ||
      isFeatureFlagEnabledInCookies(featureFlagName, cookies),
    [cookies, featureFlagName],
  );

  const set = useCallback<Dispatch<SetStateAction<boolean>>>(
    (val) => {
      setCookie(cookieName, typeof val === 'function' ? val(isEnabled) : val);
    },
    [cookieName, isEnabled, setCookie],
  );

  const remove = useCallback(() => {
    removeCookie(cookieName);
  }, [cookieName, removeCookie]);

  return useMemo(
    () => [isEnabled, set, remove] as const,
    [isEnabled, set, remove],
  );
};

const isFeatureFlagEnabledInCookies = (
  featureFlagName: FeatureFlagName,
  cookies: any,
) => {
  const cookieName = createCookieName(featureFlagName);
  return cookies?.[cookieName] === true || cookies?.[cookieName] === 'true';
};

const isFeatureFlagEnabledInEnv = (featureFlagName: FeatureFlagName) => {
  const { publicRuntimeConfig } = getConfig() ?? {};
  return publicRuntimeConfig?.[createCookieName(featureFlagName)] === 'true';
};

export {
  createCookieName,
  FeatureFlags,
  isFeatureFlagEnabledInCookies,
  isFeatureFlagEnabledInEnv,
  useFeatureFlag,
};
