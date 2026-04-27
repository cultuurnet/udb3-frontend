import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SupportedLanguage } from '@/i18n/index';
import { Countries, Country } from '@/types/Country';
import type { Place } from '@/types/Place';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Panel } from '@/ui/Panel';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { City, CityPicker } from '../CityPicker';
import { CountryPicker } from './CountryPicker';
import { PlaceTypeahead } from './PlaceTypeahead';

const MAX_DEPARTURE_LOCATIONS = 20;

const getGlobalValue = getValueFromTheme('global');

type DepartureLocation = {
  city?: City;
  country: Country;
  place?: Place;
};

const createEmptyDepartureLocation = (): DepartureLocation => ({
  city: undefined,
  country: Countries.BE,
  place: undefined,
});

const AccessibilityStep = () => {
  const { t, i18n } = useTranslation();

  const [departureLocations, setDepartureLocations] = useState<
    DepartureLocation[]
  >([createEmptyDepartureLocation()]);

  const updateDepartureLocation = (
    index: number,
    update: Partial<DepartureLocation>,
  ) => {
    setDepartureLocations((prev) =>
      prev.map((location, i) =>
        i === index ? { ...location, ...update } : location,
      ),
    );
  };

  const handleAddDepartureLocation = () => {
    if (departureLocations.length >= MAX_DEPARTURE_LOCATIONS) return;
    setDepartureLocations((prev) => [...prev, createEmptyDepartureLocation()]);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={3}>
        <Title size={3}>
          {t('create.additionalInformation.accessibility.departure.title')}
        </Title>
        <Text>
          {t('create.additionalInformation.accessibility.departure.info')}
        </Text>
      </Stack>

      <Stack spacing={5}>
        {departureLocations.map((location, index) => (
          <Panel key={index} padding={4} maxWidth="40rem">
            <Stack spacing={4}>
              <Title size={3} color="primary">
                {t(
                  'create.additionalInformation.accessibility.departure.location_title',
                  { number: index + 1 },
                )}
              </Title>

              {!location.city ? (
                <Inline spacing={1} alignItems="center">
                  <CityPicker
                    name={`departure-city-${index}`}
                    country={location.country}
                    value={location.city}
                    onChange={(city) =>
                      updateDepartureLocation(index, { city, place: undefined })
                    }
                    width="22rem"
                  />
                  <CountryPicker
                    value={location.country}
                    onChange={(country) =>
                      updateDepartureLocation(index, {
                        country,
                        city: undefined,
                        place: undefined,
                      })
                    }
                    css={`
                      & button {
                        margin-bottom: 0.3rem;
                      }
                    `}
                  />
                </Inline>
              ) : (
                <Inline alignItems="center" spacing={3}>
                  <Icon
                    name={Icons.CHECK_CIRCLE}
                    color={getGlobalValue('successColor')}
                  />
                  <Text>
                    {location.city.name}
                    {location.city.zip ? `, ${location.city.zip}` : ''}
                  </Text>
                  <Button
                    variant={ButtonVariants.LINK}
                    onClick={() =>
                      updateDepartureLocation(index, {
                        city: undefined,
                        place: undefined,
                      })
                    }
                  >
                    {t(
                      `create.location.municipality.change_${location.country.toLowerCase()}`,
                    )}
                  </Button>
                </Inline>
              )}

              {location.city &&
                (!location.place ? (
                  <FormElement
                    id={`departure-place-${index}`}
                    label={t(
                      'create.additionalInformation.accessibility.departure.place_label',
                    )}
                    Component={
                      <PlaceTypeahead
                        value={location.place}
                        municipality={location.city}
                        country={location.country}
                        placeholder={t(
                          'create.additionalInformation.accessibility.departure.place_placeholder',
                        )}
                        onChange={(place) =>
                          updateDepartureLocation(index, { place })
                        }
                      />
                    }
                  />
                ) : (
                  <Inline alignItems="center" spacing={3}>
                    <Icon
                      name={Icons.CHECK_CIRCLE}
                      color={getGlobalValue('successColor')}
                    />
                    <Text>
                      {getLanguageObjectOrFallback(
                        location.place.name,
                        i18n.language as SupportedLanguage,
                        location.place.mainLanguage ?? 'nl',
                      )}
                    </Text>
                    <Button
                      variant={ButtonVariants.LINK}
                      onClick={() =>
                        updateDepartureLocation(index, { place: undefined })
                      }
                    >
                      {t('create.location.country.change_location')}
                    </Button>
                  </Inline>
                ))}
            </Stack>
          </Panel>
        ))}
      </Stack>

      <Button
        iconName={Icons.PLUS}
        variant={ButtonVariants.SECONDARY}
        onClick={handleAddDepartureLocation}
        disabled={departureLocations.length >= MAX_DEPARTURE_LOCATIONS}
        width="auto"
        alignSelf="flex-start"
      >
        {t('create.additionalInformation.accessibility.departure.add')}
      </Button>
    </Stack>
  );
};

export { AccessibilityStep };
