import debounce from 'lodash/debounce';
import { useState } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';

import { EventTypes } from '@/constants/EventTypes';
import { useGetPlacesByQuery } from '@/hooks/api/places';
import { useUitpasLabels } from '@/hooks/useUitpasLabels';
import { SupportedLanguage } from '@/i18n/index';
import { Address, AddressInternal } from '@/types/Address';
import { Country } from '@/types/Country';
import type { Place } from '@/types/Place';
import type { Values } from '@/types/Values';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { isNewEntry, Typeahead } from '@/ui/Typeahead';
import { UitpasIcon } from '@/ui/UitpasIcon';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { isUitpasLocation } from '@/utils/uitpas';
import { valueToArray } from '@/utils/valueToArray';

import { City } from '../CityPicker';

type Props = {
  value?: Place | null;
  onChange: (place: Place) => void;
  onAddNewPlace?: (name: string) => void;
  terms?: Array<Values<typeof EventTypes>>;
  municipality?: City;
  country?: Country;
  placeholder?: string;
  maxWidth?: string;
};

const PlaceTypeahead = ({
  value,
  onChange,
  onAddNewPlace,
  terms = [],
  municipality,
  country,
  placeholder,
  maxWidth = '28rem',
}: Props) => {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
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
    { enabled: !!searchInput },
  );

  const places = useGetPlacesQuery.data?.member ?? [];

  const getPlaceName = (
    name: Place['name'],
    mainLanguage: SupportedLanguage,
  ): AddressInternal['streetAddress'] =>
    getLanguageObjectOrFallback(
      name,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );

  const getAddress = (
    address: Address,
    mainLanguage: SupportedLanguage,
  ): AddressInternal =>
    getLanguageObjectOrFallback(
      address,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );

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
        const { streetAddress } = getAddress(address, mainLanguage);
        const isUitpas = isUitpasLocation(place, uitpasLabels);

        return (
          <Stack>
            <Inline justifyContent="space-between">
              <Text
                maxWidth={`calc(100% - ${isUitpas ? '3rem' : '0rem'})`}
                css={`
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                <Highlighter search={text}>{placeName}</Highlighter>
              </Text>
              {isUitpas && <UitpasIcon width="2rem" />}
            </Inline>
            <Text
              className={'address'}
              css={`
                color: ${({ theme }) => theme.colors.grey6};
              `}
            >
              <Highlighter search={text}>{streetAddress}</Highlighter>
            </Text>
          </Stack>
        );
      }}
      selected={valueToArray(value as Place)}
      maxWidth={maxWidth}
      onChange={(selected) => {
        const place = selected[0];

        if (isNewEntry(place)) {
          onAddNewPlace?.(place.label);
          return;
        }

        onChange(place);
      }}
      minLength={3}
      placeholder={placeholder}
      newSelectionPrefix={t(
        'create.additionalInformation.place.add_new_label',
      )}
      hideNewInputText
      allowNew={onAddNewPlace ? () => !isMovie : false}
    />
  );
};

export { PlaceTypeahead };
