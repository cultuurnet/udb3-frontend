import { Controller } from 'react-hook-form';

import type { FormDataUnion, StepProps } from '@/pages/Steps';
import { Text } from '@/ui/Text';

const ThemeStep = <TFormData extends FormDataUnion>({
  control,
  field,
}: StepProps<TFormData>) => {
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
