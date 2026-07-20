import { useRouter } from 'next/router';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { StepProps } from '@/pages/steps/Steps';
import { Alert } from '@/ui/Alert';
import { CultuurKuurIcon } from '@/ui/CultuurKuurIcon';
import { FormElement } from '@/ui/FormElement';
import { LabelPositions, LabelVariants } from '@/ui/Label';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Switch, SwitchVariants } from '@/ui/Switch';

type CultuurkuurStepProps = StackProps & StepProps;

const CultuurkuurStep = ({
  control,
  watch,
  onChange,
  mainLanguage,
  name,
  ...props
}: CultuurkuurStepProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const organizerId = router.query.organizerId as string;

  return (
    <Stack spacing={4} maxWidth="36.5rem" {...getStackProps(props)}>
      <Controller
        name={'nameAndUrl.isCultuurkuur'}
        control={control}
        render={({ field }) => (
          <>
            <FormElement
              id={field.name}
              label={
                <>
                  {t('organizers.create.step1.is_cultuurkuur')}
                  <CultuurKuurIcon marginLeft={2} />
                </>
              }
              labelVariant={LabelVariants.NORMAL}
              labelPosition={LabelPositions.RIGHT}
              Component={
                <Switch
                  checked={field.value}
                  disabled={!!organizerId && field.value}
                  onCheckedChange={() => {
                    field.onChange(!field.value);
                    onChange({
                      isCultuurkuur: !field.value,
                    });
                  }}
                  variant={SwitchVariants.SUCCESS}
                />
              }
            />
            {field.value && (
              <Alert variant="primary">
                {t('organizers.create.step1.is_cultuurkuuur_info')}
              </Alert>
            )}
          </>
        )}
      />
    </Stack>
  );
};

export { CultuurkuurStep };
