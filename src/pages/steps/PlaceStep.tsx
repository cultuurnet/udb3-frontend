import { TFunction } from 'i18next';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import { TypeaheadMenu } from 'react-bootstrap-typeahead';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { EventTypes } from '@/constants/EventTypes';
import { ScopeTypes } from '@/constants/OfferType';
import { useGetPlacesByQuery } from '@/hooks/api/places';
import { useStreetAddressTypeahead } from '@/hooks/useStreetAddressTypeAhead';
import { useUitpasLabels } from '@/hooks/useUitpasLabels';
import { SupportedLanguage } from '@/i18n/index';
import type { StepProps, StepsConfiguration } from '@/pages/steps/Steps';
import { Address, AddressInternal } from '@/types/Address';
import { Countries, Country } from '@/types/Country';
import type { Place } from '@/types/Place';
import type { Values } from '@/types/Values';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import type { StackProps } from '@/ui/Stack';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { isOneTimeSlotValid } from '@/ui/TimeTable';
import { isNewEntry, Typeahead } from '@/ui/Typeahead';
import { UitpasIcon } from '@/ui/UitpasIcon';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { isUitpasLocation } from '@/utils/uitpas';
import { valueToArray } from '@/utils/valueToArray';

import { City } from '../CityPicker';
import { PlaceAddModal } from '../PlaceAddModal';

const getGlobalValue = getValueFromTheme('global');

type PlaceStepProps = StackProps &
  StepProps & {
    terms?: Array<Values<typeof EventTypes>>;
    municipality?: City;
    country?: Country;
    defaultStreetAndNumber?: string;
    chooseLabel: (t: TFunction) => string;
    placeholderLabel: (t: TFunction) => string;
  };

const PlaceStep = ({
  formState: { errors },
  getValues,
  setValue,
  reset,
  control,
  name,
  loading,
  onChange,
  terms = [],
  municipality,
  country,
  scope,
  defaultStreetAndNumber,
  chooseLabel,
  placeholderLabel,
  ...props
}: PlaceStepProps) => {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState(defaultStreetAndNumber);
  const [prefillPlaceName, setPrefillPlaceName] = useState('');
  const [isPlaceAddModalVisible, setIsPlaceAddModalVisible] = useState(false);

  const { uitpasLabels } = useUitpasLabels();

  const isMovie = terms.includes(EventTypes.Bioscoop);

  const useGetPlacesQuery = useGetPlacesByQuery(
    {
      searchTerm: searchInput,
      terms,
      zip: municipality?.zip,
      addressLocality: municipality?.name,
      addressCountry: country,
    },
    { enabled: !!searchInput && scope === ScopeTypes.EVENTS },
  );

  const formatMunicipalityName = (name: string) => {
    if (typeof name !== 'string' || !name.includes('/')) return name;

    const [firstPart] = name.split('/');
    return firstPart.trim();
  };

  // Inside PlaceStep component, replace the existing street address logic with:
  const streetAddressTypeahead = useStreetAddressTypeahead({
    city: {
      zip: municipality?.zip,
      name: formatMunicipalityName(municipality?.name),
    },
    country,
    enabled: scope !== ScopeTypes.EVENTS && country === Countries.BE,
  });

  // Initialize the hook with the default value
  useEffect(() => {
    if (defaultStreetAndNumber) {
      streetAddressTypeahead.setCurrentInputValue(defaultStreetAndNumber);
    }
  }, [defaultStreetAndNumber, streetAddressTypeahead]);

  const places = useMemo(() => {
    if (scope !== ScopeTypes.EVENTS) {
      return streetAddressTypeahead.options;
    }

    return useGetPlacesQuery.data?.member ?? [];
  }, [useGetPlacesQuery.data?.member, streetAddressTypeahead.options, scope]);

  const place = useWatch({ control, name: 'location.place' });

  const getPlaceName = (
    name: Place['name'],
    mainLanguage: SupportedLanguage,
  ): AddressInternal['streetAddress'] => {
    return getLanguageObjectOrFallback(
      name,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );
  };

  const getAddress = (
    address: Address,
    mainLanguage: SupportedLanguage,
  ): AddressInternal => {
    return getLanguageObjectOrFallback(
      address,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );
  };

  const filterByCallback = (place: Place, props) => {
    const name = getPlaceName(place.name, place.mainLanguage);
    const address = getAddress(place.address, place.mainLanguage);

    return (
      address?.streetAddress
        ?.toLowerCase()
        .includes(props.text.toLowerCase()) ||
      name?.toLowerCase().includes(props.text.toLowerCase())
    );
  };

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selectedPlace = place?.['@id'] ? place : null;

          if (scope !== ScopeTypes.EVENTS && !selectedPlace) {
            return (
              <FormElement
                id="street-address-input"
                label={t('location.add_modal.labels.streetAndNumber')}
                Component={
                  <Typeahead
                    isLoading={streetAddressTypeahead.isLoading}
                    options={streetAddressTypeahead.options}
                    onInputChange={(value) => {
                      streetAddressTypeahead.setCurrentInputValue(value);
                      streetAddressTypeahead.setDebouncedSearchInput(value);
                      setValue(
                        'location.streetAndNumber',
                        getValues('location.streetAndNumber'),
                        {
                          shouldTouch: true,
                        },
                      );
                    }}
                    labelKey={(option: string) => option}
                    renderMenu={(results, menuProps, { text }) => {
                      if (!results || results.length === 0) return null;

                      return (
                        <TypeaheadMenu
                          {...menuProps}
                          options={results}
                          labelKey={(option: string) => option}
                          text={text}
                        />
                      );
                    }}
                    renderMenuItemChildren={(address: string, { text }) => (
                      <Highlighter search={text}>{address}</Highlighter>
                    )}
                    selected={
                      streetAddressTypeahead.currentInputValue
                        ? [streetAddressTypeahead.currentInputValue]
                        : []
                    }
                    maxWidth="28rem"
                    onChange={(selected) => {
                      const selectedAddress = selected[0];
                      if (selectedAddress) {
                        streetAddressTypeahead.setCurrentInputValue(
                          selectedAddress,
                        );
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue =
                        e.target.value?.trim() ||
                        streetAddressTypeahead.currentInputValue;
                      if (inputValue) {
                        const updatedValue = {
                          ...field.value,
                          streetAndNumber: inputValue,
                        };
                        field.onChange(updatedValue);
                        onChange(updatedValue);
                        streetAddressTypeahead.setCurrentInputValue(inputValue);
                      }
                    }}
                    minLength={1}
                    placeholder={placeholderLabel(t)}
                    allowNew={false}
                    hideNewInputText
                    inputRequired={false}
                  />
                }
                error={
                  errors?.location?.streetAndNumber &&
                  !streetAddressTypeahead.currentInputValue &&
                  t('location.add_modal.errors.streetAndNumber')
                }
              />
            );
          }

          if (scope === ScopeTypes.EVENTS && !selectedPlace) {
            return (
              <Stack>
                <PlaceAddModal
                  visible={isPlaceAddModalVisible}
                  onClose={() => setIsPlaceAddModalVisible(false)}
                  prefillPlaceName={prefillPlaceName}
                  municipality={municipality}
                  country={country}
                  onConfirmSuccess={(place) => {
                    const updatedValue = { ...field.value, place };
                    field.onChange(updatedValue);
                    onChange(updatedValue);
                    field.onBlur();
                    setIsPlaceAddModalVisible(false);
                  }}
                />
                <FormElement
                  id="place-step"
                  label={chooseLabel(t)}
                  error={
                    errors?.location?.place
                      ? t(
                          `movies.create.validation_messages.cinema.${errors.location.place.type}`,
                        )
                      : undefined
                  }
                  Component={
                    <Typeahead
                      isLoading={useGetPlacesQuery.isLoading}
                      options={places}
                      onInputChange={debounce(setSearchInput, 275)}
                      filterBy={filterByCallback}
                      labelKey={(place: Place) =>
                        getPlaceName(place.name, place.mainLanguage)
                      }
                      renderMenuItemChildren={(place: Place, { text }) => {
                        const { mainLanguage, name, address } = place;
                        const placeName = getPlaceName(name, mainLanguage);
                        const { streetAddress } = getAddress(
                          address,
                          mainLanguage,
                        );

                        const isUitpas = isUitpasLocation(place, uitpasLabels);

                        return (
                          <Stack>
                            <Inline justifyContent="space-between">
                              <Text
                                maxWidth={`calc(100% - ${
                                  isUitpas ? '3rem' : '0rem'
                                })`}
                                css={`
                                  overflow: hidden;
                                  text-overflow: ellipsis;
                                  white-space: nowrap;
                                `}
                              >
                                <Highlighter search={text}>
                                  {placeName}
                                </Highlighter>
                              </Text>
                              {isUitpas && <UitpasIcon width="2rem" />}
                            </Inline>
                            <Text
                              className={'address'}
                              css={`
                                color: ${({ theme }) => theme.colors.grey6};
                              `}
                            >
                              <Highlighter search={text}>
                                {streetAddress}
                              </Highlighter>
                            </Text>
                          </Stack>
                        );
                      }}
                      selected={valueToArray(selectedPlace as Place)}
                      maxWidth="28rem"
                      onChange={(places) => {
                        const place = places[0];

                        if (isNewEntry(place)) {
                          setPrefillPlaceName(place.label);
                          setIsPlaceAddModalVisible(true);
                          return;
                        }

                        const updatedValue = { ...field.value, place };

                        field.onChange(updatedValue);
                        onChange(updatedValue);
                      }}
                      minLength={3}
                      placeholder={placeholderLabel(t)}
                      newSelectionPrefix={t(
                        'create.additionalInformation.place.add_new_label',
                      )}
                      hideNewInputText
                      allowNew={() => !isMovie}
                    />
                  }
                />
              </Stack>
            );
          }

          return (
            <Inline alignItems="center" spacing={3}>
              <Icon
                name={Icons.CHECK_CIRCLE}
                color={getGlobalValue('successColor')}
              />
              <Text>
                {getLanguageObjectOrFallback(
                  selectedPlace.name,
                  i18n.language as SupportedLanguage,
                  selectedPlace.mainLanguage ?? 'nl',
                )}
              </Text>
              <Button
                variant={ButtonVariants.LINK}
                onClick={() => {
                  field.onChange({ ...field.value, place: undefined });
                }}
              >
                {isMovie
                  ? t('movies.create.actions.change_cinema')
                  : t('create.location.country.change_location')}
              </Button>
            </Inline>
          );
        }}
      />
    </Stack>
  );
};

const placeStepConfiguration: StepsConfiguration<'location'> = {
  Component: PlaceStep,
  validation: yup.object().shape({}).required(),
  name: 'location',
  shouldShowStep: ({ watch }) => isOneTimeSlotValid(watch('timeTable')),
  title: ({ t }) => t(`movies.create.step3.title`),
  defaultValue: {
    isOnline: false,
    country: Countries.BE,
    place: undefined,
    streetAndNumber: undefined,
    municipality: undefined,
    onlineUrl: undefined,
  },
};

export { PlaceStep, placeStepConfiguration };
