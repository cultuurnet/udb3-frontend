import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';

import {
  GetOwnershipRequestsResponse,
  OwnershipRequest,
  OwnershipState,
  useGetOwnershipRequestsQuery,
} from '@/hooks/api/ownerships';
import { List } from '@/ui/List';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Panel } from '@/ui/Panel';
import { Select } from '@/ui/Select';
import { Spinner } from '@/ui/Spinner';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import type { FetchError } from '@/utils/fetchFromApi';

const getValue = getValueFromTheme('dashboardPage');
const getGlobalValue = getValueFromTheme('global');

const itemsPerPage = 14;

const OwnershipsOverviewPage = () => {
  const router = useRouter();

  const [filteredState, setFilteredState] = useState<OwnershipState>(
    OwnershipState.REJECTED,
  );

  const page = parseInt((router.query.page as string) ?? '1');

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery(
    {
      state: filteredState,
      paginationOptions: {
        start: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      },
    },
    {
      onSuccess: (data) => console.log('data', data),
      onError: (err) => console.log('err', err),
    },
  ) as UseQueryResult<GetOwnershipRequestsResponse, FetchError>;

  const requests = useMemo(
    () => getOwnershipRequestsQuery.data?.member ?? [],
    [getOwnershipRequestsQuery.data?.member],
  );

  const totalItems = getOwnershipRequestsQuery.data?.totalItems ?? 0;
  const hasMoreThanOnePage = Math.ceil(totalItems / itemsPerPage) > 1;

  const content = useMemo(() => {
    if (getOwnershipRequestsQuery.isLoading) {
      return <Spinner />;
    }

    return (
      <Panel
        css={`
          border: none !important;
          box-shadow: unset !important;
        `}
      >
        <Select
          selected={filteredState}
          onChange={(event) =>
            setFilteredState(event.target.value as OwnershipState)
          }
        >
          {Object.values(OwnershipState).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
        <List>
          {requests.map((request, index) => (
            <List.Item
              key={request.id}
              backgroundColor={getValue('listItem.backgroundColor')}
              css={`
                margin-top: 1rem;
                margin-bottom: 1rem;
                border-radius: 0.5rem;
                box-shadow: ${getGlobalValue('boxShadow.medium')};
              `}
            >
              <Text>
                {request.ownerEmail ?? request.ownerId} {request.state}
              </Text>
            </List.Item>
          ))}
        </List>
        {hasMoreThanOnePage && (
          <Panel.Footer
            css={`
              border: none !important;
              background-color: white !important;
            `}
          >
            <Pagination
              currentPage={page}
              totalItems={totalItems}
              perPage={itemsPerPage}
              onChangePage={async (page) => {
                await router.push(
                  {
                    pathname: router.pathname,
                    query: { ...router.query, page },
                  },
                  undefined,
                  {
                    shallow: true,
                  },
                );
              }}
            />
          </Panel.Footer>
        )}
      </Panel>
    );
  }, [
    getOwnershipRequestsQuery.isLoading,
    hasMoreThanOnePage,
    requests,
    router,
    totalItems,
  ]);

  return (
    <Page>
      <Page.Title>Ownerships</Page.Title>
      <Page.Content>{content}</Page.Content>
    </Page>
  );
};

export default OwnershipsOverviewPage;
