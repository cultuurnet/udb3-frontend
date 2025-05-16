import { TFunction } from 'i18next';
import getConfig from 'next/config';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { EventTypes } from '@/constants/EventTypes';
import { OfferTypes, Scope, ScopeTypes } from '@/constants/OfferType';
import {
  HierarchicalData,
  useGetCultuurkuurRegions,
} from '@/hooks/api/cultuurkuur';
import {
  useChangeAttendanceModeMutation,
  useChangeAudienceMutation,
  useChangeLocationMutation,
  useChangeOnlineUrlMutation,
  useDeleteOnlineUrlMutation,
} from '@/hooks/api/events';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import { useChangeAddressMutation } from '@/hooks/api/places';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { SupportedLanguage } from '@/i18n/index';
import { FormData as OfferFormData } from '@/pages/create/OfferForm';
import { Address, AddressInternal } from '@/types/Address';
import { Countries, Country } from '@/types/Country';
import { AttendanceMode } from '@/types/Event';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Alert, AlertVariants, IconSuccess } from '@/ui/Alert';
import { Box, parseSpacing } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { ButtonCard } from '@/ui/ButtonCard';
import { CustomIcon, CustomIconVariants } from '@/ui/CustomIcon';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { getInlineProps, Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { RadioButtonTypes } from '@/ui/RadioButton';
import { RadioButtonWithLabel } from '@/ui/RadioButtonWithLabel';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { ToggleBox } from '@/ui/ToggleBox';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { getUniqueLabels } from '@/utils/getUniqueLabels';
import { isValidUrl } from '@/utils/isValidInfo';
import { parseOfferId } from '@/utils/parseOfferId';
import { prefixUrlWithHttps } from '@/utils/url';

import { CityPicker } from '../CityPicker';
import { CountryPicker } from './CountryPicker';
import { CultuurkuurSelectionOverview } from './CultuurkuurSelectionOverview';
import { UseEditArguments } from './hooks/useEditField';
import { useRecentLocations } from './hooks/useRecentLocations';
import { CultuurkuurModal } from './modals/CultuurkuurModal';
import { PlaceStep } from './PlaceStep';
import {
  FormDataUnion,
  getStepProps,
  StepProps,
  StepsConfiguration,
} from './Steps';

const GERMAN_ZIP_REGEX: RegExp = /\b\d{5}\b/;
const DUTCH_ZIP_REGEX: RegExp = /^\d{4}([A-Za-z0-9]{2})?$/;
export const BLANK_STREET_NUMBER = '___';

const { publicRuntimeConfig } = getConfig();

const CULTUURKUUR_LOCATION_ID = publicRuntimeConfig.cultuurKuurLocationId;
const API_URL = publicRuntimeConfig.apiUrl;

const getGlobalValue = getValueFromTheme('global');

const RecentLocations = ({ onFieldChange, ...props }) => {
  const { t, i18n } = useTranslation();
  const { recentLocations: locations } = useRecentLocations();

  return (
    <Stack {...props}>
      <Inline>
        <Text fontWeight={'bold'}>
          {t('create.location.recent_locations.title')}
        </Text>
      </Inline>
      <Alert variant={AlertVariants.PRIMARY} marginY={4}>
        {t('create.location.recent_locations.info')}
      </Alert>
      <Inline
        display={'grid'}
        css={`
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        `}
      >
        {locations.map((location) => {
          const address = getLanguageObjectOrFallback<AddressInternal>(
            location.address,
            location.mainLanguage,
          );

          return (
            <ButtonCard
              key={location['@id']}
              width={'auto'}
              marginBottom={0}
              onClick={() =>
                onFieldChange({
                  municipality: {
                    zip: address.postalCode,
                    label: `${address.postalCode} ${address.addressLocality}`,
                    name: address.addressLocality,
                  },
                  place: location,
                })
              }
              title={getLanguageObjectOrFallback(
                location.name,
                i18n.language as SupportedLanguage,
                location?.mainLanguage ?? 'nl',
              )}
              description={
                address && (
                  <>
                    {address.streetAddress}
                    <br />
                    {address.postalCode} {address.addressLocality}
                  </>
                )
              }
            />
          );
        })}
      </Inline>
    </Stack>
  );
};

const useEditLocation = ({ scope, offerId }: UseEditArguments) => {
  const { i18n } = useTranslation();
  const changeAddressMutation = useChangeAddressMutation();
  const changeOnlineUrl = useChangeOnlineUrlMutation();
  const deleteOnlineUrl = useDeleteOnlineUrlMutation();
  const changeAttendanceMode = useChangeAttendanceModeMutation();
  const changeAudienceMutation = useChangeAudienceMutation();
  const changeLocationMutation = useChangeLocationMutation();

  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );

  return async ({ location }: FormDataUnion) => {
    // For places

    if (scope === OfferTypes.PLACES) {
      if (!location.municipality || !location.streetAndNumber) return;

      const postalCode = ['NL', 'DE'].includes(location.country)
        ? location.postalCode
        : location.municipality.zip;

      const address: Address = {
        [i18n.language]: {
          streetAddress: location.streetAndNumber,
          addressCountry: location.country,
          addressLocality: location.municipality.name,
          postalCode,
        },
      };

      changeAddressMutation.mutate({
        id: offerId,
        address: address[i18n.language],
        language: i18n.language,
      });

      return;
    }

    // For events

    if (location.isOnline) {
      await changeAttendanceMode.mutateAsync({
        eventId: offerId,
        attendanceMode: AttendanceMode.ONLINE,
      });

      if (location.onlineUrl) {
        changeOnlineUrl.mutate({
          eventId: offerId,
          onlineUrl: location.onlineUrl,
        });
      } else {
        deleteOnlineUrl.mutate({
          eventId: offerId,
        });
      }

      return;
    }

    const isCultuurkuurLocation = !location.country;

    if (isCultuurkuurLocation) {
      await changeAttendanceMode.mutateAsync({
        eventId: offerId,
        attendanceMode: AttendanceMode.OFFLINE,
        location: `${API_URL}/place/${CULTUURKUUR_LOCATION_ID}`,
      });

      const changeLocationPromise = changeLocationMutation.mutateAsync({
        locationId: CULTUURKUUR_LOCATION_ID,
        eventId: offerId,
      });

      const changeAudiencePromise = !isCultuurkuurFeatureFlagEnabled
        ? changeAudienceMutation.mutateAsync({
            eventId: offerId,
            audienceType: AudienceTypes.EDUCATION,
          })
        : Promise.resolve();

      await Promise.all([changeLocationPromise, changeAudiencePromise]);

      return;
    }

    if (!location.place) return;

    await changeAttendanceMode.mutateAsync({
      eventId: offerId,
      attendanceMode: AttendanceMode.OFFLINE,
      location: location.place['@id'],
    });

    if (
      parseOfferId(location.place['@id']) !== CULTUURKUUR_LOCATION_ID &&
      !isCultuurkuurFeatureFlagEnabled
    ) {
      changeAudienceMutation.mutate({
        eventId: offerId,
        audienceType: AudienceTypes.EVERYONE,
      });
    }

    deleteOnlineUrl.mutate({
      eventId: offerId,
    });
  };
};

type PlaceStepProps = StackProps &
  StepProps & {
    terms?: Array<Values<typeof EventTypes>>;
    chooseLabel?: (t: TFunction) => string;
    placeholderLabel?: (t: TFunction) => string;
  } & { offerId?: string };

const isLocationSet = (
  scope: Scope,
  location: FormDataUnion['location'],
  formState,
) => {
  if (location?.isOnline || location?.place) {
    return true;
  }

  const isCultuurKuurLocation =
    !location?.country && scope === OfferTypes.EVENTS;

  return (
    isCultuurKuurLocation ||
    (location?.municipality?.name &&
      formState.touchedFields.location?.streetAndNumber)
  );
};

export const BlankStreetToggle = ({
  onChange,
}: {
  onChange: (address: string) => void;
}) => {
  const { t } = useTranslation();
  const [isBlankStreet, setIsBlankStreet] = useState(false);

  return (
    <RadioButtonWithLabel
      name={'blank_address'}
      label={
        <Text className={'ml-1'}>
          {t('organizer.add_modal.labels.address.blank_street')}
        </Text>
      }
      type={RadioButtonTypes.SWITCH}
      checked={isBlankStreet}
      onChange={() => {
        const streetAndNumber = isBlankStreet ? '' : BLANK_STREET_NUMBER;

        setIsBlankStreet(!isBlankStreet);
        onChange(streetAndNumber);
      }}
    />
  );
};

const LocationStep = ({
  formState,
  getValues,
  reset,
  control,
  name,
  offerId,
  onChange,
  chooseLabel = (t) => t('create.location.place.choose_label'),
  placeholderLabel = (t) => t('create.location.place.placeholder'),
  setValue,
  trigger,
  watch,
  ...props
}: PlaceStepProps) => {
  const { t } = useTranslation();

  const [streetAndNumber, setStreetAndNumber] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [hasOnlineUrlError, setHasOnlineUrlError] = useState(false);
  const scope = watch('scope') ?? props.scope;
  const [locationStreetAndNumber, locationOnlineUrl, location] = useWatch({
    control,
    name: ['location.streetAndNumber', 'location.onlineUrl', 'location'],
  });

  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );

  const isCultuurkuurEvent =
    scope === OfferTypes.EVENTS &&
    watch('audience.audienceType') === AudienceTypes.EDUCATION;

  const [
    isCultuukuurLocationModalVisible,
    setIsCultuurkuurLocationModalVisible,
  ] = useState(false);

  const shouldAddSpaceBelowTypeahead = useMemo(() => {
    if (offerId) return false;

    return !isLocationSet(scope, location, formState);
  }, [formState, location, offerId, scope]);

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const entity: Offer | Organizer | undefined = getEntityByIdQuery.data;

  const labels = useMemo(() => getUniqueLabels(entity) ?? [], [entity]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(labels);

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: offerId, scope });

  const audience = getOfferByIdQuery.data?.audience;

  const { hasRecentLocations } = useRecentLocations();

  const getCultuurkuurRegionsQuery = useGetCultuurkuurRegions();
  const cultuurkuurRegions = getCultuurkuurRegionsQuery.data;

  const handleSaveCultuurkuurLocations = (locations: string[]) => {
    if (offerId) {
      return;
    }

    setValue('labels', locations);
  };

  useEffect(() => {
    if (audience?.audienceType) {
      setAudienceType(audience.audienceType);
    }

    if (!locationStreetAndNumber && !locationOnlineUrl) return;

    if (locationStreetAndNumber) {
      setStreetAndNumber(locationStreetAndNumber);
    }

    if (locationOnlineUrl) {
      setOnlineUrl(locationOnlineUrl);
    }
  }, [locationStreetAndNumber, locationOnlineUrl, audience]);

  const handleChangeStreetAndNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const shouldShowNextStepInCreate =
      !offerId &&
      !formState.touchedFields.location?.streetAndNumber &&
      e.target.value.trim().length >= 2;

    if (shouldShowNextStepInCreate) {
      setValue('location.streetAndNumber', undefined, {
        shouldTouch: true,
      });
    }

    setStreetAndNumber(e.target.value);
  };

  return (
    <Stack
      {...getStackProps(props)}
      minHeight={
        props.minHeight ??
        (shouldAddSpaceBelowTypeahead ? '26.5rem' : 'inherit')
      }
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const { isOnline, municipality, country, place } =
            field?.value as OfferFormData['location'];

          const isDefaultZip = municipality?.zip === '0000';
          const isPhysicalLocation = !!country && !isOnline && !isDefaultZip;

          const onFieldChange = (updatedValue) => {
            updatedValue = { ...field.value, ...updatedValue };
            field.onChange(updatedValue);
            onChange(updatedValue);
            field.onBlur();
          };

          const showRecentLocations =
            scope === OfferTypes.EVENTS &&
            !isOnline &&
            country &&
            (!municipality || !place);

          const renderFieldWithRecentLocations = (children) => (
            <Stack spacing={5}>
              {scope === OfferTypes.EVENTS && OnlineToggle}
              <Inline spacing={5}>
                {showRecentLocations && hasRecentLocations && (
                  <RecentLocations flex={1} onFieldChange={onFieldChange} />
                )}
                <Stack
                  minHeight={showRecentLocations ? '450px' : 'none'}
                  spacing={4}
                  flex={1}
                >
                  {showRecentLocations && (
                    <Text fontWeight={'bold'}>
                      {hasRecentLocations
                        ? t('create.location.recent_locations.other')
                        : t('create.location.recent_locations.pick')}
                    </Text>
                  )}
                  {children}
                </Stack>
              </Inline>
            </Stack>
          );

          const OnlineToggle = (
            <Stack>
              <FormElement
                id="online-toggle"
                Component={
                  <Inline
                    spacing={5}
                    marginBottom={4}
                    alignItems="stretch"
                    maxWidth={parseSpacing(9)}
                    {...getInlineProps(props)}
                  >
                    <ToggleBox
                      onClick={() =>
                        onFieldChange({
                          isOnline: false,
                          municipality: undefined,
                          place: undefined,
                          country: Countries.BE,
                        })
                      }
                      active={isPhysicalLocation}
                      icon={
                        <CustomIcon
                          name={CustomIconVariants.PHYSICAL}
                          width="80"
                        />
                      }
                      text={t('create.location.is_physical.label')}
                      width="30%"
                      minHeight={parseSpacing(7)}
                    />
                    <ToggleBox
                      onClick={() =>
                        onFieldChange({
                          isOnline: true,
                          municipality: undefined,
                        })
                      }
                      active={isOnline}
                      icon={
                        <CustomIcon
                          name={CustomIconVariants.ONLINE}
                          width="80"
                        />
                      }
                      text={t('create.location.is_online.label')}
                      width="30%"
                      minHeight={parseSpacing(7)}
                    />
                    {isCultuurkuurFeatureFlagEnabled && isCultuurkuurEvent && (
                      <ToggleBox
                        onClick={() =>
                          onFieldChange({
                            country: undefined,
                            municipality: undefined,
                            isOnline: false,
                          })
                        }
                        active={!isPhysicalLocation && !isOnline}
                        icon={
                          <CustomIcon
                            name={CustomIconVariants.CULTUURKUUR_LOCATION}
                            width="80"
                            height="80"
                          />
                        }
                        text={t('create.location.is_cultuurkuur.label')}
                        width="30%"
                        minHeight={parseSpacing(7)}
                      />
                    )}
                  </Inline>
                }
              />
            </Stack>
          );

          if (isOnline) {
            return (
              <Stack spacing={4}>
                {renderFieldWithRecentLocations(
                  <FormElement
                    Component={
                      <Input
                        maxWidth="28rem"
                        value={onlineUrl}
                        onBlur={(e) => {
                          const prefixedUrl =
                            e.target.value === ''
                              ? e.target.value
                              : prefixUrlWithHttps(e.target.value);
                          const updatedValue = {
                            ...field?.value,
                            onlineUrl: prefixedUrl,
                          };
                          field.onChange(updatedValue);
                          if (isValidUrl(prefixedUrl)) {
                            onChange(updatedValue);
                            setHasOnlineUrlError(false);
                          } else {
                            setHasOnlineUrlError(true);
                          }
                        }}
                        onChange={(e) => {
                          setOnlineUrl(e.target.value);
                        }}
                        placeholder={t(
                          'create.location.online_url.placeholder',
                        )}
                      />
                    }
                    id="online-url"
                    label={t('create.location.online_url.label')}
                    error={
                      hasOnlineUrlError &&
                      t('create.validation_messages.location.online_url')
                    }
                    info={
                      <Text
                        variant={TextVariants.MUTED}
                        maxWidth={parseSpacing(9)}
                      >
                        {t('create.location.online_url.info')}
                      </Text>
                    }
                  />,
                )}
              </Stack>
            );
          }

          if (!country || municipality?.zip === '0000') {
            return renderFieldWithRecentLocations(
              <>
                <Inline alignItems="center" spacing={3} marginBottom={3}>
                  <Icon
                    name={Icons.CHECK_CIRCLE}
                    color={getGlobalValue('successColor')}
                  />
                  <Text>{t('create.location.country.location_school')}</Text>
                  <Button
                    variant={ButtonVariants.LINK}
                    onClick={() => {
                      onFieldChange({
                        country: Countries.BE,
                        municipality: undefined,
                      });
                      setAudienceType(AudienceTypes.EVERYONE);
                    }}
                  >
                    {t('create.location.country.change_location')}
                  </Button>
                </Inline>
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={() => setIsCultuurkuurLocationModalVisible(true)}
                >
                  <Inline spacing={2}>
                    <Icon name={Icons.PLUS_CIRCLE} />
                    <span> Add province region gemeente</span>
                  </Inline>
                </Button>

                {isCultuukuurLocationModalVisible && (
                  <CultuurkuurModal
                    visible={true}
                    data={cultuurkuurRegions}
                    selectedData={selectedLocations}
                    title={t('cultuurkuur_modal.location.title')}
                    checkboxTitle={t(
                      'cultuurkuur_modal.location.selectAllProvince',
                    )}
                    onConfirm={(selectedLocations) => {
                      setSelectedLocations(selectedLocations);
                      handleSaveCultuurkuurLocations(selectedLocations);
                      setIsCultuurkuurLocationModalVisible(false);
                    }}
                    onClose={() => setIsCultuurkuurLocationModalVisible(false)}
                  />
                )}
                <CultuurkuurSelectionOverview
                  data={cultuurkuurRegions}
                  selectedData={selectedLocations}
                />
                {!isCultuurkuurFeatureFlagEnabled && (
                  <Alert maxWidth="53rem">
                    {t('create.location.country.location_school_info')}
                  </Alert>
                )}
              </>,
            );
          }

          if (!municipality) {
            return (
              <>
                {renderFieldWithRecentLocations(
                  <Inline spacing={1} alignItems="center">
                    <CityPicker
                      name="city-picker-location-step"
                      country={country}
                      offerId={offerId}
                      value={field.value?.municipality}
                      onChange={(value) => {
                        onFieldChange({
                          municipality: value,
                          place: undefined,
                        });
                      }}
                      width="22rem"
                    />
                    <CountryPicker
                      value={country}
                      showSchoolLocation={scope === OfferTypes.EVENTS}
                      onChange={(newCountry) => {
                        onFieldChange({
                          country: newCountry,
                          place: newCountry ? place : undefined,
                        });
                      }}
                      css={`
                        & button {
                          margin-bottom: 0.3rem;
                        }
                      `}
                    />
                  </Inline>,
                )}
              </>
            );
          }

          const isPlaceAddressComplete =
            (country === Countries.BE && field.value.streetAndNumber) ||
            // @ts-ignore
            (field.value.streetAndNumber &&
              location.postalCode &&
              !formState.errors.location?.postalCode);

          return renderFieldWithRecentLocations(
            <>
              <Inline alignItems="center" spacing={3} marginBottom={4}>
                <Icon
                  name={Icons.CHECK_CIRCLE}
                  color={getGlobalValue('successColor')}
                />
                <Text>
                  {municipality.name}
                  {municipality.zip ? `, ${municipality.zip}` : ''}
                </Text>
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={() => {
                    onFieldChange({
                      municipality: undefined,
                      streetAndNumber: undefined,
                    });
                    setStreetAndNumber('');
                  }}
                >
                  {t(
                    `create.location.municipality.change_${country?.toLowerCase()}`,
                  )}
                </Button>
              </Inline>
              {scope === ScopeTypes.EVENTS && (
                <PlaceStep
                  municipality={municipality}
                  country={country}
                  chooseLabel={chooseLabel}
                  placeholderLabel={placeholderLabel}
                  {...{
                    formState,
                    getValues,
                    reset,
                    control,
                    name,
                  }}
                  {...getStepProps(props)}
                  onChange={onChange}
                />
              )}
              {([ScopeTypes.PLACES, ScopeTypes.ORGANIZERS] as Scope[]).includes(
                scope,
              ) && (
                <Stack>
                  {isPlaceAddressComplete ? (
                    <Inline alignItems="center" spacing={3}>
                      <Icon
                        name={Icons.CHECK_CIRCLE}
                        color={getGlobalValue('successColor')}
                      />
                      <Text>{field.value.streetAndNumber}</Text>
                      <Button
                        variant={ButtonVariants.LINK}
                        onClick={() => {
                          onFieldChange({
                            streetAndNumber: undefined,
                          });
                          setStreetAndNumber('');
                        }}
                      >
                        {t(`create.location.street_and_number.change`)}
                      </Button>
                    </Inline>
                  ) : (
                    <Stack>
                      {['NL', 'DE'].includes(location?.country) && (
                        <FormElement
                          marginBottom={3}
                          Component={
                            <Input
                              value={field.value.postalCode}
                              onChange={(e) => {
                                onFieldChange({
                                  postalCode: e.target.value,
                                });
                              }}
                              onBlur={() => trigger()}
                            />
                          }
                          id="location-postalCode"
                          label={t(
                            `location.add_modal.labels.postalCode.${location.country.toLowerCase()}`,
                          )}
                          maxWidth="28rem"
                          error={
                            formState.errors.location?.postalCode &&
                            t('location.add_modal.errors.postalCode')
                          }
                        />
                      )}
                      <FormElement
                        Component={
                          <Input
                            value={streetAndNumber}
                            disabled={streetAndNumber === BLANK_STREET_NUMBER}
                            onBlur={() => onFieldChange({ streetAndNumber })}
                            onChange={handleChangeStreetAndNumber}
                          />
                        }
                        id="location-streetAndNumber"
                        label={t('location.add_modal.labels.streetAndNumber')}
                        maxWidth="28rem"
                        error={
                          formState.errors.location?.streetAndNumber &&
                          t('location.add_modal.errors.streetAndNumber')
                        }
                        info={
                          scope === ScopeTypes.ORGANIZERS && (
                            <BlankStreetToggle
                              onChange={(streetAndNumber) =>
                                onFieldChange({
                                  streetAndNumber,
                                  location: { streetAndNumber },
                                })
                              }
                            />
                          )
                        }
                      />
                    </Stack>
                  )}
                </Stack>
              )}
            </>,
          );
        }}
      />
    </Stack>
  );
};

const locationStepConfiguration: StepsConfiguration<'location'> = {
  Component: LocationStep,
  name: 'location',
  shouldShowStep: ({ watch }) => !!watch('typeAndTheme')?.type?.id,
  title: ({ t, scope }) => t(`create.location.title.${scope}`),
  defaultValue: {
    isOnline: false,
    country: Countries.BE,
    place: undefined,
    streetAndNumber: undefined,
    postalCode: undefined,
    municipality: undefined,
    onlineUrl: undefined,
  },
  validation: yup.lazy((value) => {
    const url = window.location.href;

    if (url.includes('organizers') && url.includes('create')) {
      return yup.object();
    }

    const scope = url.includes('events')
      ? OfferTypes.EVENTS
      : OfferTypes.PLACES;

    if (value.place) {
      // a location for an event
      return yup
        .object()
        .shape({
          place: yup.object().shape({}).required(),
          country: yup.mixed<Country>().oneOf(Object.values(Countries)),
        })
        .required();
    }

    // an online location for a event
    if (value.isOnline) {
      return yup
        .object()
        .shape({
          onlineUrl: yup.string().url(),
        })
        .required();
    }

    // a cultuurkuur event
    if (!value.country) {
      return yup.object().shape({}).required();
    }

    if (value.country === Countries.NL && scope === OfferTypes.PLACES) {
      return yup
        .object({
          streetAndNumber: yup.string().required(),
          country: yup.string().oneOf(Object.values(Countries)).required(),
          postalCode: yup.string().matches(DUTCH_ZIP_REGEX).required(),
        })
        .required();
    }

    if (value.country === Countries.DE && scope === OfferTypes.PLACES) {
      return yup
        .object({
          streetAndNumber: yup.string().required(),
          country: yup.string().oneOf(Object.values(Countries)).required(),
          postalCode: yup.string().matches(GERMAN_ZIP_REGEX).required(),
        })
        .required();
    }

    return yup.object({
      streetAndNumber: yup.string().required(),
      country: yup.string().oneOf(Object.values(Countries)).required(),
    });
  }),
};

LocationStep.defaultProps = {};

export {
  DUTCH_ZIP_REGEX,
  GERMAN_ZIP_REGEX,
  isLocationSet,
  LocationStep,
  locationStepConfiguration,
  useEditLocation,
};
