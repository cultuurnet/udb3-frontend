import { useCookiesWithOptions } from './useCookiesWithOptions';

const FeatureFlags = {
  REACT_DASHBOARD: 'react_dashboard',
  REACT_CREATE: 'react_create',
};

const createCookieName = (identifier: any) => `ff_${identifier}`;

const useFeatureFlag = (featureFlagName: any) => {
  if (!featureFlagName) return [false, () => {}];

  const { cookies, setCookie } = useCookiesWithOptions();

  const cookieName = createCookieName(featureFlagName);

  const set = (value: any) => setCookie(cookieName, value);
  const value = cookies?.[cookieName] ?? false;

  return [value === 'true', set];
};

export { useFeatureFlag, createCookieName, FeatureFlags };
