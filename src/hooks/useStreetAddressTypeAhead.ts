import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';

import { useGetStreetAddressesQuery } from '@/hooks/api/places';
import { Countries, Country } from '@/types/Country';

type UseStreetAddressTypeaheadOptions = {
  city?: { zip?: string; name?: string };
  country?: Country;
  enabled?: boolean;
  debounceMs?: number;
  defaultValue?: string;
};

export const useStreetAddressTypeahead = ({
  city,
  country,
  enabled = true,
  debounceMs = 275,
  defaultValue = '',
}: UseStreetAddressTypeaheadOptions = {}) => {
  const [searchInput, setSearchInput] = useState('');
  const [currentInputValue, setCurrentInputValue] = useState(defaultValue);

  const setDebouncedSearchInput = useMemo(
    () => debounce(setSearchInput, debounceMs),
    [debounceMs],
  );

  const query = useGetStreetAddressesQuery(
    {
      zip: city?.zip,
      addressLocality: city?.name,
      addressCountry: country,
      streetAddress: searchInput,
    },
    {
      enabled: enabled && !!searchInput && !!city && country === Countries.BE,
    },
  );

  const filteredOptions = useMemo(() => {
    const input = currentInputValue?.toLowerCase().trim();
    const addresses = query.data ?? [];

    if (!input) return [];

    const shouldHideOptions =
      input &&
      addresses.some((address) => {
        return (
          input.startsWith(address.toLowerCase()) &&
          input.length > address.length
        );
      });

    return shouldHideOptions ? [] : addresses;
  }, [query.data, currentInputValue]);

  return {
    searchInput,
    currentInputValue,
    setCurrentInputValue,
    setDebouncedSearchInput,
    isLoading: query.isLoading,
    options: filteredOptions,
    rawData: query.data,
    error: query.error,
    isError: query.isError,
  };
};
