import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Page' or its correspondin... Remove this comment to see the full error message
import { Page } from '@/ui/Page';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/InputWithLabel' or its co... Remove this comment to see the full error message
import { InputWithLabel } from '@/ui/InputWithLabel';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
import {
  useAddEventById,
  useDeleteEventsByIds,
  useGetProductions,
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/productions' or it... Remove this comment to see the full error message
} from '@/hooks/api/productions';
import { useCallback, useEffect, useMemo, useState } from 'react';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Link' or its correspondin... Remove this comment to see the full error message
import { Link } from '@/ui/Link';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/events' or its cor... Remove this comment to see the full error message
import { useGetEventsByIds } from '@/hooks/api/events';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferId' or its c... Remove this comment to see the full error message
import { parseOfferId } from '@/utils/parseOfferId';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/authenticated-quer... Remove this comment to see the full error message
import { QueryStatus } from '@/hooks/api/authenticated-query';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Text' or its correspondin... Remove this comment to see the full error message
import { Text } from '@/ui/Text';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import throttle from 'lodash/throttle';
import { useQueryClient } from 'react-query';
import { DeleteModal } from './DeleteModal';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Events' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { Events } from './Events';
import { Productions } from './Productions';
import { dehydrate } from 'react-query/hydration';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/getApplicationServerSi... Remove this comment to see the full error message
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const productionsPerPage = 15;

const Index = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');

  const [activeProductionId, setActiveProductionId] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState('');
  const [toBeAddedEventId, setToBeAddedEventId] = useState('');

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddActionVisible, setIsAddActionVisible] = useState(false);
  const [currentPageProductions, setCurrentPageProductions] = useState(1);
  const [errorMessageEvents, setErrorMessageEvents] = useState('');

  const getProductionsQuery = useGetProductions({
    name: searchInput,
    start: currentPageProductions - 1,
    limit: productionsPerPage,
  });

  const rawProductions = getProductionsQuery.data?.member ?? [];

  useEffect(() => {
    if (rawProductions.length === 0) {
      setActiveProductionId('');
    } else {
      setActiveProductionId(rawProductions[0].production_id);
    }
  }, [rawProductions]);

  const productions = useMemo(() => {
    return rawProductions.map((production) => ({
      ...production,
      id: production.production_id,
      active: production.production_id === activeProductionId,
    }));
  }, [activeProductionId, rawProductions]);

  const activeProduction = useMemo(
    () => productions.find((production) => production.active),
    [productions],
  );

  const totalItemsProductions = getProductionsQuery.data?.totalItems ?? 0;

  const getEventsByIdsQuery = useGetEventsByIds({
    ids: activeProduction?.events ?? [],
  });

  const events = useMemo(() => {
    if (!getEventsByIdsQuery.data) return [];
    return getEventsByIdsQuery.data
      .map((event) => {
        const eventId = event?.['@id'];
        if (!eventId) return undefined;

        const id = parseOfferId(eventId);
        return {
          ...event,
          id,
          selected: selectedEventIds.includes(id),
        };
      })
      .filter((event) => event);
  }, [getEventsByIdsQuery.data]);

  const handleSuccessDeleteEvents = async () => {
    await queryClient.invalidateQueries('productions');
    setSelectedEventIds([]);
  };

  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'never[]' is not assignable to pa... Remove this comment to see the full error message
  const deleteEventsByIdsMutation = useDeleteEventsByIds({
    onSuccess: handleSuccessDeleteEvents,
  });

  const handleSuccessAddEvent = async () => {
    await queryClient.invalidateQueries('productions');
    setToBeAddedEventId('');
  };

  const handleErrorAddEvent = (error) => setErrorMessageEvents(error.message);

  const handleToggleSelectEvent = (selectedEventId) => {
    setIsAddActionVisible(false);
    setToBeAddedEventId('');

    setSelectedEventIds((oldSelectedEventIds) => {
      if (oldSelectedEventIds.includes(selectedEventId)) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'filter' does not exist on type 'string'.
        return oldSelectedEventIds.filter((id) => selectedEventId !== id);
      }
      // @ts-expect-error ts-migrate(2569) FIXME: Type 'string' is not an array type or a string typ... Remove this comment to see the full error message
      return [...oldSelectedEventIds, selectedEventId];
    });
  };

  const addEventByIdMutation = useAddEventById({
    onSuccess: handleSuccessAddEvent,
    onError: handleErrorAddEvent,
  });

  const handleInputSearch = useCallback((event) => {
    const searchTerm = event.target.value.toString().trim();
    setCurrentPageProductions(1);
    setSearchInput(searchTerm);
  }, []);

  return (
    <Page>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Page.Title>{t('menu.productions')}</Page.Title>
      <Page.Actions>
        <Link
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          href="/manage/productions/create"
          css="text-transform: lowercase;"
        >
          {t('productions.overview.create')}
        </Link>
      </Page.Actions>
      <Page.Content spacing={5}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <InputWithLabel
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          id="productions-overview-search"
          placeholder={t('productions.overview.search.placeholder')}
          onInput={throttle(handleInputSearch, 275)}
        >
          {t('productions.overview.search.label')}
        </InputWithLabel>
        <Inline spacing={5}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          {getProductionsQuery.status !== QueryStatus.LOADING &&
          productions.length === 0 ? (
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Text>{t('productions.overview.no_productions')}</Text>
          ) : (
            [
              <Productions
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                key="productions"
                loading={
                  getProductionsQuery.status === QueryStatus.LOADING &&
                  searchInput !== ''
                }
                width="40%"
                productions={productions}
                currentPage={currentPageProductions}
                totalItems={totalItemsProductions}
                perPage={productionsPerPage}
                onClickProduction={setActiveProductionId}
                onChangePage={setCurrentPageProductions}
              />,
              <Events
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                key="events"
                loading={getEventsByIdsQuery.status === QueryStatus.LOADING}
                flex={1}
                events={events}
                activeProductionName={activeProduction?.name ?? ''}
                errorMessage={errorMessageEvents}
                onToggleSelectEvent={handleToggleSelectEvent}
                onClickDelete={() => setIsDeleteModalVisible(true)}
                onCancelAddEvent={() => {
                  setToBeAddedEventId('');
                  setIsAddActionVisible(false);
                }}
                onClickAdd={() => {
                  setIsAddActionVisible(true);
                }}
                onAddEvent={() => {
                  setErrorMessageEvents('');
                  addEventByIdMutation.mutate({
                    productionId: activeProduction.id,
                    eventId: toBeAddedEventId,
                  });
                }}
                isAddActionVisible={isAddActionVisible}
                toBeAddedEventId={toBeAddedEventId}
                onDismissError={() => {
                  setErrorMessageEvents('');
                }}
                onToBeAddedEventIdInput={(newInput) => {
                  setToBeAddedEventId(newInput);
                  setErrorMessageEvents('');
                }}
              />,
            ]
          )}
        </Inline>
        <DeleteModal
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          visible={isDeleteModalVisible}
          eventCount={selectedEventIds.length}
          productionName={activeProduction?.name ?? ''}
          onConfirm={() => {
            deleteEventsByIdsMutation.mutate({
              productionId: activeProduction.id,
              eventIds: selectedEventIds,
            });
            setIsDeleteModalVisible(false);
          }}
          onClose={() => setIsDeleteModalVisible(false)}
        />
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    const productions = await useGetProductions({
      req,
      queryClient,
      name: '',
      start: 0,
      limit: productionsPerPage,
    });

    const eventIds = productions?.member?.[0]?.events ?? [];

    await useGetEventsByIds({ req, queryClient, ids: eventIds });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Index;
