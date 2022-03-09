import { Controller } from 'react-hook-form';

import type { StepProps } from '@/pages/Steps';
import { Text } from '@/ui/Text';

const ThemeStep = ({ control, field }: StepProps<FormData>) => {
  return (
    <Controller
      control={control}
      name={field}
      render={({ field }) => {
        return <Text>{field.name}</Text>;
      }}
    />
  );
};

export { ThemeStep };
