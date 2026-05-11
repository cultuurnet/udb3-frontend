import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import {
  queryOptions,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Headers } from '@/hooks/api/types/Headers';
import { fetchFromApi } from '@/utils/fetchFromApi';

import { SupportedLanguages } from '../../i18n';
import { Values } from '../../types/Values';
import { useHeaders } from './useHeaders';

type ApiHoliday = {
  startDate: string;
  endDate: string;
  type: string;
  region?: string;
  name: Partial<Record<Values<typeof SupportedLanguages>, string>>;
};

const getHolidays = async ({
  headers,
  startDate,
  endDate,
  region,
}: {
  headers: Headers;
  startDate: string;
  endDate?: string;
  region?: string;
}): Promise<ApiHoliday[]> => {
  const searchParams = new URLSearchParams({ startDate });
  if (endDate) searchParams.set('endDate', endDate);
  if (region) searchParams.set('region', region);

  const res = await fetchFromApi({
    path: '/holidays/',
    searchParams,
    options: { headers },
  });
  return (await res.json()) as ApiHoliday[];
};

const createGetHolidaysQueryOptions = ({
  startDate,
  endDate,
  region,
}: {
  startDate: string;
  endDate?: string;
  region?: string;
}) =>
  queryOptions({
    queryKey: ['holidays'],
    queryFn: getHolidays,
    queryArguments: { startDate, endDate, region },
    retry: false,
  });

const useGetHolidaysQuery = ({
  startDate,
  endDate,
  region,
  enabled,
}: {
  startDate: string;
  endDate?: string;
  region?: string;
  enabled?: boolean;
}) =>
  useAuthenticatedQuery({
    ...createGetHolidaysQueryOptions({ startDate, endDate, region }),
    enabled,
  });

const useHolidays = (year?: number, enabled?: boolean) => {
  const resolvedYear = year ?? new Date().getFullYear();

  const { data } = useGetHolidaysQuery({
    startDate: `${resolvedYear}-01-01`,
    endDate: `${resolvedYear}-12-31`,
    enabled,
  });

  return data;
};

const useFetchHolidays = () => {
  const headers = useHeaders();
  const queryClient = useQueryClient();

  return useCallback(
    (startDate: string, endDate: string): Promise<ApiHoliday[]> =>
      queryClient.fetchQuery({
        queryKey: ['holidays', startDate, endDate],
        queryFn: () => getHolidays({ headers, startDate, endDate }),
      }),
    [headers, queryClient],
  );
};

const useHolidaysWithToggle = () => {
  const [showHolidays, setShowHolidays] = useState(false);
  const [viewedYear, setViewedYear] = useState(new Date().getFullYear());
  const apiHolidays = useHolidays(viewedYear, showHolidays);
  const fetchHolidays = useFetchHolidays();

  const onShowHolidaysChange = (shown: boolean, year: number) => {
    setShowHolidays(shown);
    setViewedYear(year);
  };

  return { apiHolidays, onShowHolidaysChange, fetchHolidays };
};

export { useFetchHolidays, useHolidays, useHolidaysWithToggle };
export type { ApiHoliday };
