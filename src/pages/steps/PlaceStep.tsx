import { TFunction } from 'i18next';
import { useState } from 'react';
import { Highlighter, TypeaheadMenu } from 'react-bootstrap-typeahead';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { EventTypes } from '@/constants/EventTypes';
import { ScopeTypes } from '@/constants/OfferType';
import { useStreetAddressTypeahead } from '@/hooks/useStreetAddressTypeAhead';
import { SupportedLanguage } from '@/i18n/index';
import type { StepProps, StepsConfiguration } from '@/pages/steps/Steps';
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
import { Typeahead } from '@/ui/Typeahead';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { City } from '../CityPicker';
import { PlaceAddModal } from '../PlaceAddModal';
import { PlaceTypeahead } from './PlaceTypeahead';

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
  const [prefillPlaceName, setPrefillPlaceName] = useState('');
  const [isPlaceAddModalVisible, setIsPlaceAddModalVisible] = useState(false);

  const isMovie = terms.includes(EventTypes.Bioscoop);

  const formatMunicipalityName = (name: string) => {
    if (typeof name !== 'string' || !name.includes('/')) return name;

    const [firstPart] = name.split('/');
    return firstPart.trim();
  };

  const streetAddressTypeahead = useStreetAddressTypeahead({
    city: {
      zip: municipality?.zip,
      name: formatMunicipalityName(municipality?.name),
    },
    country,
    enabled: scope !== ScopeTypes.EVENTS && country === Countries.BE,
    defaultValue: defaultStreetAndNumber,
  });

  const place = useWatch({ control, name: 'location.place' });

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
                    <PlaceTypeahead
                      value={selectedPlace as Place}
                      terms={terms}
                      municipality={municipality}
                      country={country}
                      placeholder={placeholderLabel(t)}
                      onChange={(place) => {
                        const updatedValue = { ...field.value, place };
                        field.onChange(updatedValue);
                        onChange(updatedValue);
                      }}
                      onAddNewPlace={
                        isMovie
                          ? undefined
                          : (name) => {
                              setPrefillPlaceName(name);
                              setIsPlaceAddModalVisible(true);
                            }
                      }
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
