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

  const set = (value) => setCookie(cookieName, value);
  const isEnabled = isFeatureFlagEnabledInCookies(featureFlagName, cookies);

  return [isEnabled, set];
};

const isFeatureFlagEnabledInCookies = (featureFlagName, cookies) => {
  const cookieName = createCookieName(featureFlagName);
  return cookies?.[cookieName] === 'true' ?? false;
};

export {
  useFeatureFlag,
  createCookieName,
  isFeatureFlagEnabledInCookies,
  FeatureFlags,
};
