import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';

import {
  GetOwnershipRequestsResponse,
  OwnershipRequest,
  OwnershipState,
  useGetOwnershipRequestsQuery,
} from '@/hooks/api/ownerships';
import { useShallowRouter } from '@/hooks/useShallowRouter';
import { OwnershipsTable } from '@/pages/organizers/[organizerId]/ownerships/OwnershipsTable';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Panel } from '@/ui/Panel';
import { Select } from '@/ui/Select';
import { Spinner } from '@/ui/Spinner';
import { getValueFromTheme } from '@/ui/theme';
import type { FetchError } from '@/utils/fetchFromApi';

const getValue = getValueFromTheme('dashboardPage');
const getGlobalValue = getValueFromTheme('global');

const itemsPerPage = 14;

const Actions = ({ request }: { request: OwnershipRequest }) => {
  const { t } = useTranslation();

  if (request.state === OwnershipState.REQUESTED) {
    return (
      <Inline spacing={3}>
        <Button
          variant={ButtonVariants.SUCCESS}
          iconName={Icons.CHECK_CIRCLE}
          spacing={3}
          onClick={() => {
            // setIsQuestionModalVisible(true);
            // setSelectedRequest(request);
            // setActionType(ActionType.APPROVE);
          }}
        >
          {t('organizers.ownerships.table.actions.approve')}
        </Button>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TIMES_CIRCLE}
          spacing={3}
          onClick={() => {
            // setIsQuestionModalVisible(true);
            // setSelectedRequest(request);
            // setActionType(ActionType.REJECT);
          }}
        >
          {t('organizers.ownerships.table.actions.reject')}
        </Button>
      </Inline>
    );
  }

  if (request.state === OwnershipState.DELETED) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariants.ICON}
      iconName={Icons.TRASH}
      onClick={() => {}}
    />
  );
};

const OwnershipsOverviewPage = () => {
  const router = useRouter();
  const shallowRouter = useShallowRouter();

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
  }) as UseQueryResult<GetOwnershipRequestsResponse, FetchError>;

  const requests = useMemo(
    () => getOwnershipRequestsQuery.data?.member ?? [],
    [getOwnershipRequestsQuery.data?.member],
  );

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

  return (
    <Page>
      <Page.Title>Ownerships</Page.Title>
      <Page.Content>
        <Panel
          css={`
            border: none !important;
            box-shadow: unset !important;
          `}
          spacing={4}
        >
          <Select
            value={state}
            onChange={async (event) => {
              await handleChangeState(event.target.value);
            }}
          >
            {Object.values(OwnershipState).map((state) => (
              <option key={state} value={state}>
                {capitalize(state)}
              </option>
            ))}
          </Select>

          <Input
            placeholder="itemId"
            defaultValue={itemId ?? ''}
            onBlur={(e) => handleChangeItemId(e.target.value || undefined)}
            onKeyDown={async (e) => {
              if (e.key !== 'Enter') return;
              await handleChangeItemId(e.target.value || undefined);
            }}
          />

          {getOwnershipRequestsQuery.isLoading ? (
            <Spinner />
          ) : (
            <OwnershipsTable
              requests={requests}
              renderActions={(request) => <Actions request={request} />}
            />
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

export default OwnershipsOverviewPage;
