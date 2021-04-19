import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Text' or its correspondin... Remove this comment to see the full error message
import { Text } from '@/ui/Text';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Page' or its correspondin... Remove this comment to see the full error message
import { Page } from '@/ui/Page';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/TypeaheadWithLabel' or it... Remove this comment to see the full error message
import { TypeaheadWithLabel } from '@/ui/TypeaheadWithLabel';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Button' or its correspond... Remove this comment to see the full error message
import { Button, ButtonVariants } from '@/ui/Button';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Event' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { Event } from './Event';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/getApplicationServerSi... Remove this comment to see the full error message
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferId' or its c... Remove this comment to see the full error message
import { parseOfferId } from '@/utils/parseOfferId';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  useGetProductions,
  useGetSuggestedEvents,
  useSkipSuggestedEvents,
  useCreateWithEvents,
  useMergeProductions,
  // @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/productions' or it... Remove this comment to see the full error message
  useAddEventsByIds,
} from '@/hooks/api/productions';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { Stack } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/RadioButtonGroup' or its ... Remove this comment to see the full error message
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import throttle from 'lodash/throttle';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/authenticated-quer... Remove this comment to see the full error message
import { QueryStatus } from '@/hooks/api/authenticated-query';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';

const ProductionStatus = {
  MISSING: 'missing',
  EXISTING_SELECTED: 'existingSelected',
  NEW: 'new',
};

const Create = () => {
  const minSearchLength = 3;
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [selectedProductionId, setSelectedProductionId] = useState('');
  const typeaheadComponent = useRef();

  const getSuggestedEventsQuery = useGetSuggestedEvents({ retry: false });

  const getProductionsQuery = useGetProductions({
    name: searchInput,
    limit: 10,
  });

  const handleSuccess = async () => {
    setSelectedProductionId('');
    setSearchInput('');
    await getSuggestedEventsQuery.refetch();
    typeaheadComponent?.current?.clear();
  };

  const skipSuggestedEventsMutation = useSkipSuggestedEvents({
    onSuccess: handleSuccess,
  });

  const createProductionWithEventsMutation = useCreateWithEvents({
    onSuccess: handleSuccess,
  });

  const mergeProductionsMutation = useMergeProductions({
    onSuccess: handleSuccess,
  });

  const addEventsByIdsMutation = useAddEventsByIds({
    onSuccess: handleSuccess,
  });

  const suggestedProductions = searchInput
    ? getProductionsQuery.data?.member ?? []
    : [];

  const events = getSuggestedEventsQuery.data?.events ?? [];
  const similarity = getSuggestedEventsQuery.data?.similarity ?? 0;

  const availableProductions = useMemo(
    () =>
      events
        .map((event) => event?.production)
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
        .filter((production) => !!production),
    [events],
  );

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'production' implicitly has an 'any' typ... Remove this comment to see the full error message
  const selectedProduction = useMemo(
    () =>
      availableProductions.find(
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'production' implicitly has an 'any' typ... Remove this comment to see the full error message
        (production) => production.id === selectedProductionId,
      ),
    [selectedProductionId],
  );

  const isEditingProduction = useMemo(
    () =>
      [
        createProductionWithEventsMutation.status,
        mergeProductionsMutation.status,
        addEventsByIdsMutation.status,
      ].some((status) => status === QueryStatus.LOADING),
    [
      createProductionWithEventsMutation.status,
      mergeProductionsMutation.status,
      addEventsByIdsMutation.status,
    ],
  );

  useEffect(() => {
    if (availableProductions.length === 1) {
      setSelectedProductionId(availableProductions[0].id);
    }
  }, [availableProductions]);

  const status = useMemo(() => {
    if (selectedProductionId) {
      return ProductionStatus.EXISTING_SELECTED;
    }
    if (searchInput) {
      return ProductionStatus.NEW;
    }
    return ProductionStatus.MISSING;
  }, [selectedProductionId, searchInput]);

  const handleInputSearch = useCallback((searchTerm) => {
    const trimmedSearchTerm = searchTerm.toString().trim();

    if (trimmedSearchTerm.length < minSearchLength) {
      return;
    }

    setSelectedProductionId(undefined);
    setSearchInput(trimmedSearchTerm);
  }, []);

  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'undefined' is not assignable to ... Remove this comment to see the full error message
  const handleClickLink = () => {
    if (status === ProductionStatus.MISSING) return;
    if (status === ProductionStatus.NEW) {
      // create a new production
      createProductionWithEventsMutation.mutate({
        productionName: searchInput,
        eventIds: events.map((event) => parseOfferId(event['@id'])),
      });
      return;
    }
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
    // merge the unselected production into the selected production when there are 2 availableProductions
    if (availableProductions.length === 2) {
      const unselectedProductionId = availableProductions.find(
        (production) => production.id !== selectedProductionId,
      )?.id;
      mergeProductionsMutation.mutate({
        fromProductionId: unselectedProductionId,
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'production' implicitly has an 'any' typ... Remove this comment to see the full error message
        toProductionId: selectedProductionId,
      });
      return;
    }
    // add event to production when there is only 1 production
    addEventsByIdsMutation.mutate({
      productionId: selectedProductionId,
      eventIds: events
        .filter((event) => !event.production)
        .map((event) => parseOfferId(event['@id'])),
    });
  };

  return (
    <Page>
      <Page.Title>{t('productions.create.title')}</Page.Title>
      <Page.Content>
        {/* @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type. */}
        {getSuggestedEventsQuery.status === QueryStatus.LOADING ? (
          // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
          <Spinner marginTop={4} />
        ) : events.length === 0 ? (
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <Text>{t('productions.create.no_suggested_events_found')}</Text>
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        ) : (
          <Stack spacing={5}>
            <Text>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Text fontWeight="bold">
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                {t('productions.create.suggested_events')}
              </Text>{' '}
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              {Math.round(similarity * 100)}%
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            </Text>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Inline spacing={4}>
              {events.map((event) => {
                const id = event?.['@id'] && parseOfferId(event['@id']);
                return (
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <Event
                    id={id}
                    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
                    key={id}
                    title={
                      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      event?.name?.[i18n.language] ??
                      event?.name?.[event.mainLanguage]
                    }
                    locationName={
                      event?.location?.name?.[i18n.language] ??
                      event?.location?.name?.[event.location.mainLanguage]
                    }
                    locationCity={
                      event?.location?.address?.[i18n.language]
                        ?.addressLocality ??
                      event?.location?.address?.[event.location.mainLanguage]
                        ?.addressLocality
                    }
                    organizerName={
                      event?.organizer?.name?.[i18n.language] ??
                      event?.organizer?.name?.[event.location.mainLanguage]
                    }
                    terms={event?.terms}
                    flex={1}
                    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    imageUrl={event?.image}
                    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    description={
                      event?.description?.[i18n.language] ??
                      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
                      event?.description?.[event.mainLanguage]
                    }
                    productionName={event?.production?.title}
                    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'productionName' implicitly has an 'any'... Remove this comment to see the full error message
                    calendarType={event?.calendarType}
                  />
                );
              })}
            </Inline>
            {/* @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type. */}
            <Stack spacing={4}>
              {availableProductions.length === 2 ? (
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <RadioButtonGroup
                  name="production-names"
                  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'production' implicitly has an 'any' typ... Remove this comment to see the full error message
                  items={events
                    .map((event) =>
                      event.production
                        ? {
                            label: event.production.title,
                            value: event.production.id,
                          }
                        : undefined,
                    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'selected' implicitly has an 'any' type.
                    )
                    .filter((productionName) => productionName !== undefined)}
                  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'undefined' is not assignable to ... Remove this comment to see the full error message
                  groupLabel={t('productions.create.production_name')}
                  onChange={(e) => {
                    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    setSelectedProductionId(e.target.value.toString());
                  }}
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                />
              ) : (
                <TypeaheadWithLabel
                  id="typeahead-productionname"
                  options={suggestedProductions}
                  labelKey={(production) => production.name}
                  disabled={!!selectedProduction}
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  placeholder={selectedProduction?.title}
                  maxWidth="43rem"
                  label={t('productions.create.production_name')}
                  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
                  emptyLabel={t('productions.create.no_productions')}
                  minLength={minSearchLength}
                  onInputChange={throttle(handleInputSearch, 275)}
                  onChange={(selected) => {
                    if (!selected || selected.length !== 1) {
                      setSelectedProductionId(undefined);
                      return;
                    }
                    setSelectedProductionId(selected[0].production_id);
                  }}
                  ref={typeaheadComponent}
                />
              )}
              <Inline spacing={3}>
                <Button
                  variant={ButtonVariants.SUCCESS}
                  disabled={
                    status === ProductionStatus.MISSING ||
                    skipSuggestedEventsMutation.status === QueryStatus.LOADING
                  }
                  onClick={handleClickLink}
                  loading={isEditingProduction}
                >
                  {t('productions.create.link')}
                </Button>
                <Button
                  variant={ButtonVariants.DANGER}
                  onClick={() => {
                    skipSuggestedEventsMutation.mutate({
                      eventIds: events.map((event) =>
                        parseOfferId(event['@id']),
                      ),
                    });
                  }}
                  disabled={isEditingProduction}
                >
                  {t('productions.create.skip')}
                </Button>
              </Inline>
            </Stack>
          </Stack>
        )}
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Create;
