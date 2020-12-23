import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/publiq-ui/Text';
import { Page } from '../../../components/publiq-ui/Page';
import { TypeaheadWithLabel } from '../../../components/publiq-ui/TypeaheadWithLabel';
import { getInlineProps, Inline } from '../../../components/publiq-ui/Inline';
import { Button, ButtonVariants } from '../../../components/publiq-ui/Button';
import { Event } from '../../../components/manage/productions/create/Event';
import { getApplicationServerSideProps } from '../../../utils/getApplicationServerSideProps';
import { parseEventId } from '../../../utils/parseEventId';
import { useState, useMemo, useEffect } from 'react';
import {
  useGetProductions,
  useGetSuggestedEvents,
  useSkipSuggestedEvents,
  useCreateWithEvents,
  useMergeProductions,
  useAddEventsByIds,
} from '../../../hooks/api/productions';
import { getStackProps, Stack } from '../../../components/publiq-ui/Stack';
import { RadioButtonGroup } from '../../../components/publiq-ui/RadioButtonGroup';
import { getBoxProps } from '../../../components/publiq-ui/Box';
import { debounce } from 'lodash';
import { useQueryClient } from 'react-query';
import { QueryStatus } from '../../../hooks/api/authenticated-query';
import { Spinner } from '../../../components/publiq-ui/Spinner';

const ZeroOrOneProduction = ({
  productionName,
  suggestedProductions,
  onInput,
  onSelection,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <TypeaheadWithLabel
      id="typeahead-productionname"
      options={suggestedProductions}
      labelKey={(production) => production.name}
      disabled={!!productionName}
      placeholder={productionName}
      maxWidth="43rem"
      label={t('productions.create.production_name')}
      emptyLabel={t('productions.create.no_productions')}
      onInput={onInput}
      onSelection={onSelection}
      {...getBoxProps(props)}
    />
  );
};

ZeroOrOneProduction.propTypes = {
  productionName: PropTypes.string,
  suggestedProductions: PropTypes.array,
  onInput: PropTypes.func,
  onSelection: PropTypes.func,
  className: PropTypes.string,
};

ZeroOrOneProduction.defaultProps = {
  suggestedProductions: [],
};

const TwoProductions = ({ productionNames, onChange, ...props }) => {
  const { t } = useTranslation();
  return (
    <RadioButtonGroup
      name="production-names"
      items={productionNames}
      groupLabel={t('productions.create.production_name')}
      onChange={onChange}
      {...getStackProps(props)}
    />
  );
};

TwoProductions.propTypes = {
  productionNames: PropTypes.array,
  onChange: PropTypes.func,
};

TwoProductions.defaultProps = {
  productionNames: [],
};

const LinkAndSkipButtons = ({
  shouldDisableLinkButton,
  onClickLink,
  onClickSkip,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <Inline spacing={3} {...getInlineProps(props)}>
      <Button
        variant={ButtonVariants.SUCCESS}
        disabled={shouldDisableLinkButton}
        onClick={onClickLink}
      >
        {t('productions.create.link')}
      </Button>
      <Button variant={ButtonVariants.DANGER} onClick={onClickSkip}>
        {t('productions.create.skip')}
      </Button>
    </Inline>
  );
};

LinkAndSkipButtons.propTypes = {
  shouldDisableLinkButton: PropTypes.bool,
  onClickLink: PropTypes.func,
  onClickSkip: PropTypes.func,
};

const ProductionStatus = {
  MISSING: 'missing',
  EXISTING_SELECTED: 'existingSelected',
  NEW: 'new',
};

const Create = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [selectedProductionId, setSelectedProductionId] = useState('');

  const {
    data: suggestedEvents,
    status: suggestedEventsStatus,
    refetch: refetchSuggestedEvents,
  } = useGetSuggestedEvents();
  const { data: suggestedProductionsData } = useGetProductions({
    name: searchInput,
    limit: 10,
  });

  const handleSuccess = async () => {
    setSelectedProductionId('');
    setSearchInput('');
    await refetchSuggestedEvents();
    await queryClient.refetchQueries(['productions']);
  };

  const { mutate: skipSuggestedEvents } = useSkipSuggestedEvents({
    onSuccess: handleSuccess,
  });

  const { mutate: createProductionWithEvents } = useCreateWithEvents({
    onSuccess: handleSuccess,
  });

  const { mutate: mergeProductions } = useMergeProductions({
    onSuccess: handleSuccess,
  });

  const { mutate: addEventsByIds } = useAddEventsByIds({
    onSuccess: handleSuccess,
  });

  const suggestedProductions = suggestedProductionsData?.member ?? [];
  const events = suggestedEvents?.events ?? [];
  const similarity = suggestedEvents?.similarity ?? 0;

  const productions = useMemo(
    () =>
      events
        .map((event) => event?.production)
        .filter((production) => !!production),
    [events],
  );

  useEffect(() => {
    if (productions.length === 1) {
      setSelectedProductionId(productions[0].id);
    }
  }, [productions]);

  const status = useMemo(() => {
    if (selectedProductionId) {
      return ProductionStatus.EXISTING_SELECTED;
    }
    if (searchInput) {
      return ProductionStatus.NEW;
    }
    return ProductionStatus.MISSING;
  }, [selectedProductionId, searchInput]);

  const handleInputSearch = (searchTerm) => {
    debounce(() => setSearchInput(searchTerm.toString().trim()), 275)();
  };

  const handleClickLink = () => {
    if (status === ProductionStatus.MISSING) return;
    if (status === ProductionStatus.NEW) {
      // create a new production
      createProductionWithEvents({
        productionName: searchInput,
        eventIds: events.map((event) => parseEventId(event['@id'])),
      });
      return;
    }
    // merge the unselected production into the selected production when there are 2 productions
    if (productions.length === 2) {
      const unselectedProductionId = productions.find(
        (production) => production.id !== selectedProductionId,
      )?.id;
      mergeProductions({
        fromProductionId: unselectedProductionId,
        toProductionId: selectedProductionId,
      });
      return;
    }
    // add event to production when there is only 1 production
    addEventsByIds({
      productionId: selectedProductionId,
      eventIds: events
        .filter((event) => !event.production)
        .map((event) => parseEventId(event['@id'])),
    });
  };

  return (
    <Page>
      <Page.Title>{t('productions.create.title')}</Page.Title>
      <Page.Content>
        {suggestedEventsStatus === QueryStatus.LOADING ? (
          <Spinner marginTop={4} />
        ) : (
          <Stack spacing={5}>
            <Text>
              <Text fontWeight="bold">
                {t('productions.create.suggested_events')}
              </Text>{' '}
              {Math.round(similarity * 100)}%
            </Text>
            <Inline spacing={4}>
              {events.map((event) => {
                return (
                  <Event
                    id={parseEventId(event['@id'])}
                    key={parseEventId(event['@id'])}
                    title={event.name[i18n.language ?? event.mainLanguage]}
                    locationName={
                      event.location.name[
                        i18n.language ?? event.location.mainLanguage
                      ]
                    }
                    locationCity={
                      event.location.address[
                        i18n.language ?? event.location.mainLanguage
                      ].addressLocality
                    }
                    terms={event.terms}
                    flex={1}
                    imageUrl={event.image}
                    description={event.description[i18n.language]}
                    productionName={event?.production?.title}
                    calendarType={event.calendarType}
                  />
                );
              })}
            </Inline>
            <Stack spacing={4}>
              {productions.length === 2 ? (
                <TwoProductions
                  productionNames={events
                    .map((event) =>
                      event.production
                        ? {
                            label: event.production.title,
                            value: event.production.id,
                          }
                        : undefined,
                    )
                    .filter((productionName) => productionName !== undefined)}
                  onChange={(e) => {
                    setSelectedProductionId(e.target.value.toString());
                  }}
                />
              ) : (
                <ZeroOrOneProduction
                  suggestedProductions={suggestedProductions}
                  productionName={
                    productions.find(
                      (production) => production.id === selectedProductionId,
                    )?.title
                  }
                  onInput={handleInputSearch}
                  onSelection={(production) => {
                    setSelectedProductionId(production.id);
                  }}
                />
              )}
              <LinkAndSkipButtons
                shouldDisableLinkButton={status === ProductionStatus.MISSING}
                onClickLink={handleClickLink}
                onClickSkip={() => {
                  skipSuggestedEvents({
                    eventIds: events.map((event) => parseEventId(event['@id'])),
                  });
                }}
              />
            </Stack>
          </Stack>
        )}
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Create;
