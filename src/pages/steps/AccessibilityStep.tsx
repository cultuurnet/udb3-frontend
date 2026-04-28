import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChangeDeparturePlacesMutation } from '@/hooks/api/events';
import { getPlaceById } from '@/hooks/api/places';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { useHeaders } from '@/hooks/api/useHeaders';
import { SupportedLanguage } from '@/i18n/index';
import {
  TabContentProps,
  ValidationStatus,
} from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { AddressInternal } from '@/types/Address';
import { Countries, Country } from '@/types/Country';
import type { Event } from '@/types/Event';
import type { Place } from '@/types/Place';
import { Button, ButtonSizes, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Panel } from '@/ui/Panel';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

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

type CollapsedSelectionProps = {
  label: ReactNode;
  onClear: () => void;
  clearLabel: string;
};

const CollapsedSelection = ({
  label,
  onClear,
  clearLabel,
}: CollapsedSelectionProps) => (
  <Inline alignItems="center" spacing={3}>
    <Icon name={Icons.CHECK_CIRCLE} color={getGlobalValue('successColor')} />
    <Text>{label}</Text>
    <Button variant={ButtonVariants.LINK} onClick={onClear}>
      {clearLabel}
    </Button>
  </Inline>
);

const AccessibilityStep = ({
  offerId,
  scope,
  field,
  onSuccessfulChange,
  onValidationChange,
}: TabContentProps) => {
  const { t, i18n } = useTranslation();
  const headers = useHeaders();

  const [departureLocations, setDepartureLocations] = useState<
    DepartureLocation[]
  >([createEmptyDepartureLocation()]);

  const hasInitialized = useRef(false);

  const changeDeparturePlacesMutation = useChangeDeparturePlacesMutation({
    onSuccess: onSuccessfulChange,
  });

  const getEntityByIdQuery = useGetEntityByIdAndScope({
    id: offerId,
    scope,
  });
  const entity = getEntityByIdQuery.data as Event | undefined;

  useEffect(() => {
    if (!field) return;
    onValidationChange?.(
      entity?.departurePlaces?.length
        ? ValidationStatus.SUCCESS
        : ValidationStatus.NONE,
      field,
    );
  }, [entity?.departurePlaces, field, onValidationChange]);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!entity?.departurePlaces?.length) return;
    hasInitialized.current = true;

    let cancelled = false;

    (async () => {
      const places = await Promise.all(
        entity.departurePlaces!.map((uri) =>
          getPlaceById({ headers, id: parseOfferId(uri) }),
        ),
      );

      if (cancelled) return;

      const loaded: DepartureLocation[] = places
        .filter((place): place is Place => !!place)
        .map((place) => {
          const localized = getLanguageObjectOrFallback<AddressInternal>(
            place.address,
            i18n.language as SupportedLanguage,
            place.mainLanguage,
          );
          return {
            place,
            country: (localized?.addressCountry as Country) ?? Countries.BE,
            city: localized
              ? {
                  name: localized.addressLocality,
                  zip: localized.postalCode,
                  label: `${localized.addressLocality} ${localized.postalCode}`,
                }
              : undefined,
          };
        });

      if (loaded.length > 0) setDepartureLocations(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, [entity, headers, i18n.language]);

  const setAndPersist = (next: DepartureLocation[]) => {
    setDepartureLocations(next);
    if (!offerId) return;
    changeDeparturePlacesMutation.mutate({
      eventId: offerId,
      departurePlaces: next.flatMap((location) =>
        location.place ? [location.place['@id']] : [],
      ),
    });
  };

  const updateDepartureLocation = (
    index: number,
    update: Partial<DepartureLocation>,
  ) => {
    setAndPersist(
      departureLocations.map((location, i) =>
        i === index ? { ...location, ...update } : location,
      ),
    );
  };

  const handleAddDepartureLocation = () => {
    if (departureLocations.length >= MAX_DEPARTURE_LOCATIONS) return;
    setDepartureLocations((prev) => [...prev, createEmptyDepartureLocation()]);
  };

  const handleDeleteDepartureLocation = (index: number) => {
    const next = departureLocations.filter((_, i) => i !== index);
    setAndPersist(next.length > 0 ? next : [createEmptyDepartureLocation()]);
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
              <Inline justifyContent="space-between" alignItems="center">
                <Title size={3} color="primary">
                  {t(
                    'create.additionalInformation.accessibility.departure.location_title',
                    { number: index + 1 },
                  )}
                </Title>
                <Button
                  iconName={Icons.TRASH}
                  variant={ButtonVariants.DANGER}
                  size={ButtonSizes.SMALL}
                  aria-label={t(
                    'create.additionalInformation.accessibility.departure.delete',
                  )}
                  onClick={() => handleDeleteDepartureLocation(index)}
                />
              </Inline>

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
                  />
                </Inline>
              ) : (
                <Stack spacing={3}>
                  <CollapsedSelection
                    label={`${location.city.name}${location.city.zip ? `, ${location.city.zip}` : ''}`}
                    clearLabel={t(
                      `create.location.municipality.change_${location.country.toLowerCase()}`,
                    )}
                    onClear={() =>
                      updateDepartureLocation(index, {
                        city: undefined,
                        place: undefined,
                      })
                    }
                  />
                </Stack>
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
                        name={`departure-place-${index}`}
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
                  <CollapsedSelection
                    label={getLanguageObjectOrFallback(
                      location.place.name,
                      i18n.language as SupportedLanguage,
                      location.place.mainLanguage ?? 'nl',
                    )}
                    clearLabel={t('create.location.country.change_location')}
                    onClear={() =>
                      updateDepartureLocation(index, { place: undefined })
                    }
                  />
                ))}
            </Stack>
          </Panel>
        ))}
      </Stack>

      <Stack spacing={2} alignItems="flex-start">
        <Button
          iconName={Icons.PLUS}
          variant={ButtonVariants.SECONDARY}
          onClick={handleAddDepartureLocation}
          disabled={departureLocations.length >= MAX_DEPARTURE_LOCATIONS}
          width="auto"
        >
          {t('create.additionalInformation.accessibility.departure.add')}
        </Button>
        {departureLocations.length >= MAX_DEPARTURE_LOCATIONS && (
          <Text color="red">
            {t(
              'create.additionalInformation.accessibility.departure.max_reached',
            )}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export { AccessibilityStep };
