import { UseQueryResult } from '@tanstack/react-query';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SortField, SortOrder, SortOrderType } from '@/constants/SortOptions';
import {
  GetOrganizerByIdResponse,
  useGetOrganizerByIdQuery,
} from '@/hooks/api/organizers';
import {
  GetOwnershipRequestsResponse,
  OwnershipState,
  useGetOwnershipRequestsQuery,
} from '@/hooks/api/ownerships';
import { useOwnershipActions } from '@/hooks/ownerships/useOwnershipActions';
import { useShallowRouter } from '@/hooks/useShallowRouter';
import { OrganizerPicker } from '@/pages/manage/ownerships/OrganizerPicker';
import { OwnershipsTable } from '@/pages/organizers/[organizerId]/ownerships/OwnershipsTable';
import { Organizer } from '@/types/Organizer';
import { parseSpacing } from '@/ui/Box';
import { Inline } from '@/ui/Inline';
import { LabelPositions } from '@/ui/Label';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Panel } from '@/ui/Panel';
import { Select } from '@/ui/Select';
import { SelectWithLabel } from '@/ui/SelectWithLabel';
import { Spinner } from '@/ui/Spinner';
import { Text } from '@/ui/Text';
import type { FetchError } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { parseOfferId } from '@/utils/parseOfferId';

const itemsPerPage = 14;

const OwnershipsOverviewPage = () => {
  const router = useRouter();
  const shallowRouter = useShallowRouter();
  const { t } = useTranslation();
  const [sortOrder, setSortOrder] = useState<SortOrderType>(SortOrder.DESC);

  const state =
    (router.query.state as OwnershipState | undefined) ??
    OwnershipState.REQUESTED;
  const itemId = router.query.itemId as OwnershipState | undefined;

  const page = parseInt((router.query.page as string) ?? '1');

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    itemId,
    state,
    paginationOptions: {
      start: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
    sortOptions: {
      field: SortField.CREATED,
      order: sortOrder,
    },
  }) as UseQueryResult<GetOwnershipRequestsResponse, FetchError>;

  const requests = useMemo(
    () => getOwnershipRequestsQuery.data?.member ?? [],
    [getOwnershipRequestsQuery.data?.member],
  );
  const [organizer, setOrganizer] = useState<Organizer | undefined>();

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: itemId,
  }) as UseQueryResult<GetOrganizerByIdResponse>;

  const fetchedOrganizer = getOrganizerByIdQuery.data;

  useEffect(() => {
    if (!fetchedOrganizer) return;

    setOrganizer(fetchedOrganizer);
  }, [fetchedOrganizer]);

  useEffect(() => {
    if (!itemId && organizer) {
      setOrganizer(undefined);
    }
  }, [itemId, organizer]);

  const totalItems = getOwnershipRequestsQuery.data?.totalItems ?? 0;
  const hasMoreThanOnePage = Math.ceil(totalItems / itemsPerPage) > 1;

  const handleChangeState = async (newState: string) => {
    const params: Record<string, string> = {};

    if (newState !== state) {
      params['page'] = '1';
    }

    params['state'] = newState;

    await shallowRouter.pushSearchParams(params);
  };

  const handleChangeItemId = async (newItemId: string | undefined) => {
    const params: Record<string, string> = {};

    if (newItemId !== itemId) {
      params['page'] = '1';
    }

    params['itemId'] = newItemId;

    await shallowRouter.pushSearchParams(params);
  };

  const handleChangePage = async (page: number) => {
    await shallowRouter.pushSearchParams({ page: `${page}` });
  };

  const { deleteOwnership, approveOwnership, rejectOwnership, Modal, Alert } =
    useOwnershipActions();

  const handleSelectSorting = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSortOrder = event.target.value as SortOrderType;
    setSortOrder(selectedSortOrder);
  };

  return (
    <Page>
      <Page.Title>{t('ownerships.overview.title')}</Page.Title>
      <Page.Content>
        <Panel
          css={`
            border: none !important;
            box-shadow: unset !important;
          `}
          spacing={4}
        >
          <Modal />
          <Alert />

          <Select
            value={state}
            onChange={async (event) => {
              await handleChangeState(event.target.value);
            }}
            maxWidth={parseSpacing(8)}
          >
            {Object.values(OwnershipState).map((state) => (
              <option key={state} value={state}>
                {capitalize(state)}
              </option>
            ))}
          </Select>
          <Inline justifyContent="space-between" alignItems="flex-end">
            <OrganizerPicker
              selected={organizer}
              onChange={async ([value]) => {
                setOrganizer(value);
                await handleChangeItemId(
                  value ? parseOfferId(value['@id']) : undefined,
                );
              }}
            />
            {!getOwnershipRequestsQuery.isFetching && (
              <Inline alignItems="center" spacing={4}>
                <Text>
                  <Text fontWeight="bold">{requests.length}</Text>{' '}
                  {t('ownerships.requests')}
                </Text>
                <SelectWithLabel
                  key="select"
                  id="sorting"
                  label={`${t('dashboard.sorting.label')}:`}
                  value={sortOrder}
                  onChange={handleSelectSorting}
                  width="auto"
                  labelPosition={LabelPositions.LEFT}
                >
                  <option value="desc">
                    {t('ownerships.sorting.requested_desc')}
                  </option>
                  <option value="asc">
                    {t('ownerships.sorting.requested_asc')}
                  </option>
                </SelectWithLabel>
              </Inline>
            )}
          </Inline>

          {getOwnershipRequestsQuery.isLoading ? (
            <Spinner />
          ) : (
            <>
              <OwnershipsTable
                requests={requests}
                shouldShowItemId
                shouldShowOwnerId
                onApprove={approveOwnership}
                onReject={rejectOwnership}
                onDelete={deleteOwnership}
              />
            </>
          )}

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
                onChangePage={handleChangePage}
              />
            </Panel.Footer>
          )}
        </Panel>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default OwnershipsOverviewPage;
