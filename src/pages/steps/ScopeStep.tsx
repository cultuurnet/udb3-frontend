import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { Controller, ControllerRenderProps, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Audience, AudienceType } from '@/constants/AudienceType';
import { OfferType, OfferTypes } from '@/constants/OfferType';
import { useChangeAudienceMutation } from '@/hooks/api/events';
import { AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { CustomIcon, CustomIconVariants } from '@/ui/CustomIcon';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { LabelPositions, LabelVariants } from '@/ui/Label';
import { RadioButton, RadioButtonTypes } from '@/ui/RadioButton';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { ToggleBox } from '@/ui/ToggleBox';

import { Scope } from '../create/OfferForm';
import { CultuurKuurIcon } from '../CultuurKuurIcon';
import { FormDataUnion, StepProps, StepsConfiguration } from './Steps';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

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
  audience,
  watch,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const { replace } = useRouter();

  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );

  const audienceField = watch('audience.audienceType');

  useEffect(() => {
    setValue('scope', scope);
  }, [scope, setValue]);

  useEffect(() => {
    if (!audience) return;

    if (!!audienceField) return;

    setValue('audience.audienceType', audience);
  }, [audience, setValue, audienceField]);

  const isCultuurkuurEvent = audienceField === AudienceType.EDUCATION;

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

  const addAudienceMutation = useChangeAudienceMutation();

  const handleOnChangeAudience = async (audienceType: Audience) => {
    setValue('audience.audienceType', audienceType);

    if (!offerId) return;

    await addAudienceMutation.mutateAsync({
      eventId: offerId,
      audienceType,
    });
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
            {isCultuurkuurFeatureFlagEnabled &&
              field.value === OfferTypes.EVENTS && (
                <Stack spacing={4}>
                  <FormElement
                    id={field.name}
                    label={
                      <>
                        {t('steps.offerTypeStep.cultuurkuur_event')}
                        <CultuurKuurIcon marginLeft={2} />
                      </>
                    }
                    labelVariant={LabelVariants.NORMAL}
                    labelPosition={LabelPositions.RIGHT}
                    Component={
                      <RadioButton
                        type={RadioButtonTypes.SWITCH}
                        checked={isCultuurkuurEvent}
                        color={colors.udbMainPositiveGreen}
                        onChange={(e) => {
                          handleOnChangeAudience(
                            e.target.checked
                              ? AudienceType.EDUCATION
                              : AudienceType.EVERYONE,
                          );
                        }}
                      />
                    }
                  />
                  {isCultuurkuurEvent && (
                    <Alert
                      variant={AlertVariants.PRIMARY}
                      css={`
                        max-width: 36.5rem;
                      `}
                    >
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
