import { FeatureFlags } from '@/hooks/useFeatureFlag';

declare global {
  interface Window {
    FeatureFlags: typeof FeatureFlags;
    setFeatureFlag: (featureFlagName: string, value: boolean) => void;
    getCurrentFeatureFlagConfiguration: () => void;
  }
}
