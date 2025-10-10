import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Controller, ControllerRenderProps, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AudienceType, AudienceTypes } from '@/constants/AudienceType';
import { OfferType, OfferTypes } from '@/constants/OfferType';
import {
  useCultuurkuurLabelsPickerProps,
  useGetEducationLevelsQuery,
} from '@/hooks/api/cultuurkuur';
import { useChangeAudienceMutation } from '@/hooks/api/events';
import { Alert, AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { CustomIcon, CustomIconVariants } from '@/ui/CustomIcon';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { LabelPositions, LabelVariants } from '@/ui/Label';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { ToggleBox } from '@/ui/ToggleBox';
import { Tooltip } from '@/ui/Tooltip';

import { CultuurKuurIcon } from '../../ui/CultuurKuurIcon';
import { Scope } from '../create/OfferForm';
import { FormDataUnion, StepProps, StepsConfiguration } from './Steps';

type Props = InlineProps &
  StepProps & {
    offerId?: string;
    scope?: Scope;
  };

const getGlobalValue = getValueFromTheme('global');

const ScopeStep = ({
  offerId,
  control,
  name,
  setValue,
  resetField,
  scope,
  watch,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const { replace } = useRouter();

  const audienceField = watch('audience.audienceType');

  useEffect(() => {
    setValue('scope', scope);
  }, [scope, setValue]);

  const isCultuurkuurEvent = audienceField === AudienceTypes.EDUCATION;

  const handleChangeScope = (
    field: ControllerRenderProps<FormDataUnion, string & Path<FormDataUnion>>,
    scope: OfferType,
  ) => {
    field.onChange(scope);
    replace(`/create?scope=${scope}`, undefined, { shallow: true });
    resetFieldsAfterScopeChange();
  };

  const resetFieldsAfterScopeChange = () => {
    if (offerId) return;
    resetField('typeAndTheme');
    resetField('calendar');
    resetField('location');
  };

  const queryClient = useQueryClient();
  const addAudienceMutation = useChangeAudienceMutation();

  const levels = useGetEducationLevelsQuery();
  const labelsPickerEducationLevelProps = useCultuurkuurLabelsPickerProps(
    { scope, offerId, setValue, watch },
    levels,
  );

  const handleOnChangeAudience = async (audienceType: AudienceType) => {
    setValue('audience.audienceType', audienceType);

    if (audienceType !== AudienceTypes.EDUCATION) {
      labelsPickerEducationLevelProps.onClean();
    }

    if (!offerId) return;

    await addAudienceMutation.mutateAsync({
      eventId: offerId,
      audienceType,
    });

    await queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <Stack spacing={4.5}>
            <Inline
              spacing={5}
              alignItems="stretch"
              maxWidth={parseSpacing(9)}
              {...getInlineProps(props)}
            >
              <ToggleBox
                onClick={() => handleChangeScope(field, OfferTypes.EVENTS)}
                active={field.value === OfferTypes.EVENTS}
                icon={
                  <CustomIcon
                    marginTop={3}
                    marginBottom={3}
                    name={CustomIconVariants.CALENDAR}
                    width="80"
                  />
                }
                text={t('steps.offerTypeStep.types.event')}
                width="30%"
                minHeight={parseSpacing(7)}
                disabled={!!offerId}
              />
              <ToggleBox
                onClick={() => handleChangeScope(field, OfferTypes.PLACES)}
                active={field.value === OfferTypes.PLACES}
                icon={<CustomIcon name={CustomIconVariants.MAP} width="70" />}
                text={t('steps.offerTypeStep.types.place')}
                width="30%"
                minHeight={parseSpacing(7)}
                disabled={!!offerId}
              />
            </Inline>
            {field.value === OfferTypes.EVENTS && (
              <Stack spacing={4} maxWidth="36.5rem">
                <FormElement
                  id={field.name}
                  label={
                    <Inline
                      alignItems="center"
                      spacing={2}
                      opacity={offerId && isCultuurkuurEvent ? 0.7 : 1.0}
                    >
                      <span>{t('steps.offerTypeStep.cultuurkuur_event')}</span>
                      <CultuurKuurIcon marginLeft={2} />
                      {offerId && !isCultuurkuurEvent && (
                        <Tooltip
                          content={t('steps.offerTypeStep.cultuurkuur_tooltip')}
                          id={t('steps.offerTypeStep.cultuurkuur_tooltip')}
                          placement="bottom"
                        />
                      )}
                    </Inline>
                  }
                  labelVariant={LabelVariants.NORMAL}
                  labelPosition={LabelPositions.RIGHT}
                  Component={
                    <RadioButton
                      type={RadioButtonTypes.SWITCH}
                      checked={isCultuurkuurEvent}
                      color={colors.udbMainPositiveGreen}
                      disabled={offerId && isCultuurkuurEvent}
                      onChange={(e) => {
                        handleOnChangeAudience(
                          e.target.checked
                            ? AudienceTypes.EDUCATION
                            : AudienceTypes.EVERYONE,
                        );
                      }}
                    />
                  }
                />

                {isCultuurkuurEvent && (
                  <Alert variant={AlertVariants.PRIMARY}>
                    {t('steps.offerTypeStep.cultuurkuur_info')}
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        );
      }}
    />
  );
};

const scopeStepConfiguration: StepsConfiguration<'scope'> = {
  Component: ScopeStep,
  name: 'scope',
  title: ({ t }) => t(`create.scope.title`),
  shouldShowStep: () => true,
};

export { scopeStepConfiguration };
