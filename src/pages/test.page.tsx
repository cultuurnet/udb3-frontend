import { useEffect } from 'react';

import {
  AuthenticatedQueryFunctionContext,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query2';
import { Headers } from '@/hooks/api/types/Headers';
import { Event } from '@/types/Event';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

type GetEventByIdArguments = {
  headers: Headers;
  id: string;
};

const Test = () => {
  const id = 'a9e9cdce-2e3c-4b17-9c6b-a7eb445252d1';

  const getEventById = async ({
    queryKey,
    headers,
  }: AuthenticatedQueryFunctionContext) => {
    const [key, { id }] = queryKey;
    const res = await fetchFromApi({
      path: `/event/${id.toString()}`,
      options: {
        headers,
      },
    });
    if (isErrorObject(res)) {
      // eslint-disable-next-line no-console
      return console.error(res);
    }
    return await res.json();
  };

  const query = useAuthenticatedQuery<Event | null>({
    queryKey: ['events'],
    queryFn: getEventById,
    queryArguments: { id },
    enabled: !!id,
  });

  useEffect(() => {
    query.data;
    console.log(query.data);
  }, [query.data]);

  return null;
};

export default Test;
