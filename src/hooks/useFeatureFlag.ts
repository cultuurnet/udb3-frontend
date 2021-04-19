import { useCookiesWithOptions } from './useCookiesWithOptions';

const FeatureFlags = {
  REACT_DASHBOARD: 'react_dashboard',
  REACT_CREATE: 'react_create',
} as const;

const createCookieName = (identifier: string) => `ff_${identifier}`;

const useFeatureFlag = (
  featureFlagName: string,
): [boolean, (value: boolean) => void] => {
  if (!featureFlagName) return [false, () => {}];

  const { cookies, setCookie } = useCookiesWithOptions();

  const cookieName = createCookieName(featureFlagName);

  const set = (value: boolean) => setCookie(cookieName, value);
  const value = cookies?.[cookieName] ?? false;

  return [value === 'true', set];
};

export { useFeatureFlag, createCookieName, FeatureFlags };
