import { NextApiRequest } from 'next';
import { useEffect } from 'react';
import { dehydrate } from 'react-query/types/hydration';

import {
  AuthenticatedQueryFunctionContext,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query2';
import { Headers } from '@/hooks/api/types/Headers';
import { Event } from '@/types/Event';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

type GetEventByIdArguments = {
  headers: Headers;
  id: string;
};

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

const Test = () => {
  const id = 'a9e9cdce-2e3c-4b17-9c6b-a7eb445252d1';

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

export const getServerSideProps = getApplicationServerSideProps(
  async ({
    req,
    cookies,
    queryClient,
  }: {
    req: NextApiRequest;
    cookies: any;
    queryClient: any;
  }) => {
    useAuthenticatedQuery<Event | null>({
      req,
      queryClient,
      queryKey: ['events'],
      queryFn: getEventById,
      queryArguments: { id: 'a9e9cdce-2e3c-4b17-9c6b-a7eb445252d1' },
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Test;
