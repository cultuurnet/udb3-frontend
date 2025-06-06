import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import * as yup from 'yup';
import { ValidationError } from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes } from '@/constants/OfferType';
import {
  useAddOfferPriceInfoMutation,
  useGetOfferByIdQuery,
} from '@/hooks/api/offers';
import i18n, { SupportedLanguage } from '@/i18n/index';
import {
  TabContentProps,
  ValidationStatus,
} from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { isUitpasOrganizer } from '@/pages/steps/AdditionalInformationStep/OrganizerPicker';
import { Offer } from '@/types/Offer';
import type { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonSizes, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { Breakpoints, getValueFromTheme } from '@/ui/theme';
import { FetchError } from '@/utils/fetchFromApi';
import { reconcileRates } from '@/utils/reconcileRates';

const PRICE_CURRENCY: string = 'EUR';

const PRICE_REGEX: RegExp = /^([1-9][0-9]*|[0-9]|0)([.,][0-9]{1,2})?$/;

const PriceCategory = {
  BASE: 'base',
  TARIFF: 'tariff',
  UITPAS: 'uitpas',
} as const;

type PriceCategory = Values<typeof PriceCategory>;

const getValue = getValueFromTheme('priceInformation');

const isNotUitpas = (value: any) =>
  value[i18n.language] &&
  !value[i18n.language].toLowerCase().startsWith('uitpas');

const shouldHaveAName = (value: any) => !!value[i18n.language];

type Name = Partial<
  Record<SupportedLanguage | 'en', ReturnType<typeof yup.string>>
>;

const UNIQUE_NAME_ERROR_TYPE = 'unique_name';

const schema = yup
  .object({
    rates: yup
      .array()
      .of(
        yup.object({
          name: yup
            .object<Name>({
              nl: yup.string(),
              fr: yup.string(),
              en: yup.string(),
              de: yup.string(),
            })
            .when('category', {
              is: (category) => category !== PriceCategory.UITPAS,
              then: (schema) =>
                schema
                  .test(`name_is_required`, 'name is required', shouldHaveAName)
                  .test(
                    `name_is_not_uitpas`,
                    'should not be uitpas',
                    isNotUitpas,
                  )
                  .required(),
            }),
          category: yup
            .mixed<PriceCategory>()
            .oneOf(Object.values(PriceCategory)),
          price: yup.string().matches(PRICE_REGEX).required(),
          priceCurrency: yup.string(),
          groupPrice: yup.boolean().optional(),
        }),
      )
      .test(UNIQUE_NAME_ERROR_TYPE, 'No unique name', (prices, context) => {
        const priceNames = (prices ?? []).map(
          (item) => item.name[i18n.language],
        );
        const errors = priceNames
          .map((priceName, index) => {
            const indexOf = priceNames.indexOf(priceName);
            if (indexOf !== -1 && indexOf !== index) {
              return context.createError({
                path: `${context.path}.${index}`,
                message: i18n.t(
                  'create.additionalInformation.price_info.duplicate_name_error',
                  { priceName },
                ),
              });
            }
          })
          .filter(Boolean);

        return errors.length ? new ValidationError(errors) : true;
      }),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const defaultPriceInfoValues: FormData = {
  rates: [
    {
      name: {
        nl: 'Basistarief',
        fr: 'Tarif de base',
        en: 'Base tariff',
        de: 'Basisrate',
      },
      price: '',
      category: PriceCategory.BASE,
      priceCurrency: PRICE_CURRENCY,
      groupPrice: undefined,
    },
  ],
};

const groupPriceOptions = [
  {
    label: 'create.additionalInformation.price_info.cultuurkuur.per_student',
    value: 'false',
  },
  {
    label: 'create.additionalInformation.price_info.cultuurkuur.per_group',
    value: 'true',
  },
];

const PriceInformation = ({
  scope,
  field,
  offerId,
  onValidationChange,
  onSuccessfulChange,
  ...props
}: TabContentProps) => {
  const { t, i18n } = useTranslation();

  const getOfferByIdQuery = useGetOfferByIdQuery(
    { id: offerId, scope },
    { refetchOnWindowFocus: false },
  );

  const offer: Offer | undefined = getOfferByIdQuery.data;

  const {
    register,
    trigger,
    control,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: defaultPriceInfoValues,
    shouldFocusError: false,
  });

  const queryClient = useQueryClient();

  const { fields, replace, append, remove } = useFieldArray({
    name: 'rates',
    control,
  });

  const isCultuurkuurEvent =
    offer?.audience?.audienceType === AudienceTypes.EDUCATION;
  const rates = watch('rates');
  const ratesRef = useRef(rates);

  useEffect(() => {
    ratesRef.current = rates;
  }, [rates]);

  const controlledRates = useMemo(() => {
    return fields.map((field, index) => ({
      ...field,
      ...rates[index],
    }));
  }, [fields, rates]);

  const addPriceInfoMutation = useAddOfferPriceInfoMutation({
    onSuccess: async () => {
      setTimeout(() => onSuccessfulChange(), 1000);
      await queryClient.invalidateQueries([scope, { id: offerId }]);
    },
    useErrorBoundary: false,
  });

  const onSubmit = useCallback(
    () =>
      handleSubmit((data) => {
        addPriceInfoMutation.mutate({
          id: offerId,
          scope,
          priceInfo: (data.rates ?? []).map((rate) => ({
            ...rate,
            price: parseFloat(rate.price.replace(',', '.')),
          })),
        });
      })(),
    [addPriceInfoMutation, handleSubmit, offerId, scope],
  );

  const isPriceFree = (price: string) => ['0', '0,0', '0,00'].includes(price);
  const hasUitpasPrices = useMemo(
    () => (rates ?? []).some((rate) => rate.category === PriceCategory.UITPAS),
    [rates],
  );

  const hasBasePriceInfo = !!offer?.priceInfo?.find(
    (price) => price.category === PriceCategory.BASE,
  );

  const hasMultiplePrices = offer?.priceInfo?.length > 1;

  const isCultuurkuurAlertVisible =
    isCultuurkuurEvent && (!hasBasePriceInfo || hasMultiplePrices);

  useEffect(() => {
    const priceInfo = offer?.priceInfo ?? ([] as FormData['rates']);

    const hasUitpasLabel =
      offer?.organizer && scope === OfferTypes.EVENTS
        ? isUitpasOrganizer(offer?.organizer)
        : false;

    if (priceInfo.length === 0) {
      return onValidationChange(
        hasUitpasLabel || isCultuurkuurEvent
          ? ValidationStatus.WARNING
          : ValidationStatus.NONE,
        field,
      );
    }

    replace(
      reconcileRates(ratesRef.current, priceInfo, offer) as FormData['rates'],
    );
    reset({}, { keepValues: true });

    if (hasMultiplePrices && isCultuurkuurEvent) {
      return onValidationChange(ValidationStatus.WARNING, field);
    }

    onValidationChange(ValidationStatus.SUCCESS, field);
  }, [
    offer?.priceInfo,
    field,
    hasMultiplePrices,
    isCultuurkuurEvent,
    offer,
    scope,
    onValidationChange,
    replace,
    reset,
  ]);

  return (
    <Stack {...getStackProps(props)} padding={0} spacing={5}>
      <Inline spacing={4} stackOn={Breakpoints.M}>
        <Stack flex="1 0 60%">
          {controlledRates.map((rate, index) => {
            const registerNameProps = register(
              `rates.${index}.name.${i18n.language as SupportedLanguage}`,
            );

            const registerPriceProps = register(`rates.${index}.price`);

            const uniqueNameErrorFromResponse =
              addPriceInfoMutation.error &&
              addPriceInfoMutation.error instanceof FetchError &&
              addPriceInfoMutation.error.body.schemaErrors?.[0]?.jsonPointer ===
                `/priceInfo/${index}/name/nl`
                ? UNIQUE_NAME_ERROR_TYPE
                : undefined;

            const validationErrorType =
              errors.rates?.[index]?.name?.type ||
              errors.rates?.[index]?.price?.type ||
              errors.rates?.[index]?.type ||
              uniqueNameErrorFromResponse;

            return (
              <Stack key={`rate_${rate.id}`}>
                <Inline
                  maxWidth="50rem"
                  css={`
                    border-bottom: 1px solid ${getValue('borderColor')};
                  `}
                >
                  <Inline
                    width="100%"
                    paddingY={3}
                    alignItems="baseline"
                    justifyContent="flex-start"
                    spacing={3}
                  >
                    <Inline minWidth="55%">
                      {rate.category === PriceCategory.BASE && (
                        <Text width="100%">{rate.name[i18n.language]}</Text>
                      )}
                      {rate.category === PriceCategory.TARIFF && (
                        <FormElement
                          id={`rate_name_${rate.id}`}
                          Component={
                            <Input
                              {...registerNameProps}
                              onBlur={async (e) => {
                                await registerNameProps.onBlur(e);
                                const isValid = await trigger();
                                if (!isValid) {
                                  return;
                                }

                                onSubmit();
                              }}
                              placeholder={t(
                                'create.additionalInformation.price_info.target',
                              )}
                            />
                          }
                        />
                      )}
                      {rate.category === PriceCategory.UITPAS && (
                        <Text>{rate.name[i18n.language]}</Text>
                      )}
                    </Inline>
                    <Inline alignItems="center">
                      {rate.category && (
                        <FormElement
                          id={`rate_price_${rate.id}`}
                          Component={
                            <Input
                              width="6rem"
                              {...registerPriceProps}
                              onBlur={async (e) => {
                                await registerPriceProps.onBlur(e);
                                const isValid = await trigger();
                                if (!isValid) {
                                  return;
                                }

                                onSubmit();
                              }}
                              placeholder={t(
                                'create.additionalInformation.price_info.price',
                              )}
                              disabled={rate.category === PriceCategory.UITPAS}
                            />
                          }
                        />
                      )}
                    </Inline>
                    <Inline alignItems="center" spacing={3}>
                      <Text variant={TextVariants.MUTED}>
                        {t('create.additionalInformation.price_info.euro')}
                      </Text>
                      {isCultuurkuurEvent &&
                        rate.category === PriceCategory.BASE && (
                          <FormElement
                            id={`rate_groupPrice_${rate.id}`}
                            Component={
                              <Select
                                {...register(`rates.${index}.groupPrice`)}
                                onChange={(e) => {
                                  const value = e.target.value === 'true';
                                  setValue(`rates.${index}.groupPrice`, value, {
                                    shouldValidate: false,
                                  });
                                  onSubmit();
                                }}
                                width="8rem"
                              >
                                {groupPriceOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {t(option.label)}
                                  </option>
                                ))}
                              </Select>
                            }
                          />
                        )}
                      {!isPriceFree(rate.price) &&
                        rate.category !== PriceCategory.UITPAS && (
                          <Button
                            variant={ButtonVariants.LINK}
                            onClick={() => {
                              setValue(`rates.${index}.price`, '0,00', {
                                shouldValidate: false,
                              });
                              onSubmit();
                            }}
                          >
                            {t('create.additionalInformation.price_info.free')}
                          </Button>
                        )}
                    </Inline>
                    {index !== 0 && rate.category !== PriceCategory.UITPAS && (
                      <Button
                        iconName={Icons.TRASH}
                        variant={ButtonVariants.DANGER}
                        size={ButtonSizes.SMALL}
                        aria-label={t(
                          'create.additionalInformation.price_info.delete',
                        )}
                        onClick={() => {
                          remove(index);
                          onSubmit();
                        }}
                      />
                    )}
                  </Inline>
                </Inline>
                {validationErrorType && (
                  <Text color="red">
                    {t(
                      `create.additionalInformation.price_info.validation_messages.${validationErrorType}`,
                    )}
                  </Text>
                )}
              </Stack>
            );
          })}
          <Inline marginTop={3}>
            {!isCultuurkuurEvent && (
              <Button
                onClick={() => {
                  append(
                    {
                      name: { [i18n.language as SupportedLanguage]: '' },
                      price: '',
                      category: PriceCategory.TARIFF,
                      priceCurrency: PRICE_CURRENCY,
                      groupPrice: undefined,
                    },
                    {
                      focusName: `rates.${fields.length}.name`,
                      shouldFocus: true,
                    },
                  );
                }}
                variant={ButtonVariants.SECONDARY}
              >
                {t('create.additionalInformation.price_info.add')}
              </Button>
            )}
          </Inline>
        </Stack>
      </Inline>
      <Stack spacing={4}>
        {isCultuurkuurAlertVisible && (
          <Alert variant={AlertVariants.WARNING} marginBottom={3}>
            {hasBasePriceInfo
              ? t(
                  'create.additionalInformation.price_info.cultuurkuur.warning.multiple_prices',
                )
              : t(
                  'create.additionalInformation.price_info.cultuurkuur.warning.no_price',
                )}
          </Alert>
        )}
        <Alert variant={AlertVariants.PRIMARY}>
          {t('create.additionalInformation.price_info.global_info')}
        </Alert>
        {hasUitpasPrices && (
          <Alert variant={AlertVariants.PRIMARY} marginBottom={3}>
            {t('create.additionalInformation.price_info.uitpas_info')}
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export { PriceCategory, PriceInformation };
