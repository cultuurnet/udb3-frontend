import { Controller } from 'react-hook-form';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { getStepProps, StepProps } from '@/pages/steps/Steps';
import { parseSpacing } from '@/ui/Box';
import { Stack } from '@/ui/Stack';

import { CultuurkuurStep } from './CultuurkuurStep';
import { NameStep } from './NameStep';
import { UrlStep } from './UrlStep';

const NameAndUrlStep = ({ control, name, ...props }: StepProps) => {
  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );
  return (
    <Controller
      name={name}
      control={control}
      render={() => (
        <Stack spacing={4} maxWidth={parseSpacing(9)}>
          <NameStep {...getStepProps(props)} name={name} control={control} />
          <UrlStep {...getStepProps(props)} name={name} control={control} />
          {isCultuurkuurFeatureFlagEnabled && (
            <CultuurkuurStep
              {...getStepProps(props)}
              name={name}
              control={control}
            />
          )}
        </Stack>
      )}
    />
  );
};

export { NameAndUrlStep };
