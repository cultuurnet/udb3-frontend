import { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/List' or its correspondin... Remove this comment to see the full error message
import { useTranslation } from 'react-i18next';

import { List } from '@/ui/List';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/CheckboxWithLabel' or its... Remove this comment to see the full error message
import { Title } from '@/ui/Title';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Button' or its correspond... Remove this comment to see the full error message
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/theme' or its correspondi... Remove this comment to see the full error message
import { Breakpoints, getValueFromTheme } from '@/ui/theme';
import { Panel } from '@/ui/Panel';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { getInlineProps, Inline, inlinePropTypes } from '@/ui/Inline';
import { Spinner } from '@/ui/Spinner';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Alert' or its correspondi... Remove this comment to see the full error message
import { Alert, AlertVariants } from '@/ui/Alert';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/DetailTable' or its corre... Remove this comment to see the full error message
import { Input } from '@/ui/Input';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Box' or its corresponding... Remove this comment to see the full error message
import { DetailTable } from '@/ui/DetailTable';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Text' or its correspondin... Remove this comment to see the full error message
import { parseSpacing } from '@/ui/Box';
import { Text } from '@/ui/Text';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/events' or its cor... Remove this comment to see the full error message
import { useGetCalendarSummary } from '@/hooks/api/events';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/CalendarType' or i... Remove this comment to see the full error message
import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';
import { CalendarType } from '@/constants/CalendarType';

const getValue = getValueFromTheme('eventItem');

const Event = ({
  id,
  name,
  terms,
  location,
  calendarType,
  onToggle,
  selected,
  className,
}) => {
  const { i18n, t } = useTranslation();
  const getCalendarSummaryQuery = useGetCalendarSummary({
    id,
    locale: i18n?.language ?? '',
    format: calendarType === CalendarType.SINGLE ? 'lg' : 'sm',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleClickToggleExpand = () => {
    setIsExpanded((prevValue) => !prevValue);
  };

  const type = useMemo(() => {
    const typeId = terms.find((term) => term.domain === 'eventtype')?.id ?? '';
    // The custom keySeparator was necessary because the ids contain '.' which i18n uses as default keySeparator
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    return t(`offerTypes*${typeId}`, { keySeparator: '*' });
  }, [terms]);

  return (
    <List.Item
      key={id}
      paddingLeft={4}
      paddingRight={4}
      paddingBottom={3}
      paddingTop={3}
      backgroundColor="white"
      className={className}
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    >
      <Stack as="div" flex={1} spacing={3}>
        <Inline as="div" justifyContent="space-between">
          <CheckboxWithLabel
            id={id}
            name={name}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            onToggle={() => onToggle(id)}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            checked={selected}
          >
            {name}
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          </CheckboxWithLabel>
          <Button
            onClick={handleClickToggleExpand}
            // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
            variant={ButtonVariants.UNSTYLED}
          >
            <Icon
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              name={isExpanded ? Icons.CHEVRON_DOWN : Icons.CHEVRON_RIGHT}
            />
          </Button>
        </Inline>
        {isExpanded && (
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <DetailTable
            items={[
              { header: t('productions.event.type'), value: type },
              {
                header: t('productions.event.when'),
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                value: getCalendarSummaryQuery.data,
              },
              { header: t('productions.event.where'), value: location },
            ]}
          />
        )}
      </Stack>
    </List.Item>
  );
};

Event.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  terms: PropTypes.array,
  location: PropTypes.string,
  calendarType: PropTypes.string,
  onToggle: PropTypes.func,
  selected: PropTypes.bool,
  className: PropTypes.string,
};

const Actions = ({
  activeProductionName,
  onClickAdd,
  onClickDelete,
  shouldDisableDeleteButton,
  loading,
}) => {
  const { t } = useTranslation();
  const shouldCollapse = useMatchBreakpoint(Breakpoints.S);

  return (
    <Inline as="div" justifyContent="space-between" alignItems="center">
      <Title>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        {t('productions.overview.events_in_production', {
          productionName: activeProductionName,
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        })}
      </Title>
      <Inline as="div" spacing={3}>
        <Button
          iconName={Icons.PLUS}
          spacing={3}
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          maxHeight={parseSpacing(5)()}
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          onClick={onClickAdd}
          shouldHideText={shouldCollapse}
          disabled={loading}
        >
          {t('productions.overview.create')}
        </Button>
        <Button
          disabled={shouldDisableDeleteButton || loading}
          variant={ButtonVariants.DANGER}
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          iconName={Icons.TRASH}
          spacing={3}
          onClick={onClickDelete}
          maxHeight={parseSpacing(5)()}
          shouldHideText={shouldCollapse}
        >
          {t('productions.overview.delete')}
        </Button>
      </Inline>
    </Inline>
  );
};

Actions.propTypes = {
  loading: PropTypes.bool,
  activeProductionName: PropTypes.string,
  onClickAdd: PropTypes.func,
  onClickDelete: PropTypes.func,
  shouldDisableDeleteButton: PropTypes.bool,
};

const AddAction = ({
  onAdd,
  onCancel,
  className,
  toBeAddedEventId,
  onToBeAddedEventIdInput,
  ...props
}) => {
  const { t } = useTranslation();
  const shouldCollapse = useMatchBreakpoint(Breakpoints.S);

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'className' does not exist on type 'AddAc... Remove this comment to see the full error message
  return (
    <Inline
      as="div"
      className={className}
      spacing={3}
      alignItems="center"
      {...getInlineProps(props)}
    >
      <Input
        id="cdbid"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        placeholder="cdbid"
        maxWidth="22rem"
        value={toBeAddedEventId}
        onInput={(event) =>
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          onToBeAddedEventIdInput(event.currentTarget.value.trim())
        }
      />
      <Button
        iconName={Icons.CHECK}
        spacing={3}
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
        disabled={!toBeAddedEventId}
        // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
        onClick={() => onAdd(toBeAddedEventId)}
        shouldHideText={shouldCollapse}
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      >
        {t('productions.overview.confirm')}
      </Button>
      <Button
        // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
        variant={ButtonVariants.SECONDARY}
        iconName={Icons.TIMES}
        spacing={3}
        onClick={onCancel}
        shouldHideText={shouldCollapse}
      >
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        {t('productions.overview.cancel')}
      </Button>
    </Inline>
  );
};

AddAction.propTypes = {
  ...inlinePropTypes,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
  onToBeAddedEventIdInput: PropTypes.func,
  toBeAddedEventId: PropTypes.string,
};

const Events = ({
  events,
  activeProductionName,
  loading,
  errorMessage,
  onToggleSelectEvent,
  onAddEvent,
  onCancelAddEvent,
  onDismissError,
  className,
  onClickAdd,
  onClickDelete,
  isAddActionVisible,
  toBeAddedEventId,
  onToBeAddedEventIdInput,
  ...props
}) => {
  const { i18n, t } = useTranslation();

  const shouldDisableDeleteButton = !(
    events.filter((event) => event.selected).length > 0
  );

  return (
    <Stack spacing={4} {...getStackProps(props)}>
      <Stack key="title-and-buttons" spacing={3}>
        {isAddActionVisible ? (
          <Stack as="div" spacing={3}>
            <AddAction
              onAdd={onAddEvent}
              onCancel={onCancelAddEvent}
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'onCancelAddEvent' does not exist on type... Remove this comment to see the full error message
              toBeAddedEventId={toBeAddedEventId}
              onToBeAddedEventIdInput={onToBeAddedEventIdInput}
            />
            <Alert
              visible={!!errorMessage}
              variant={AlertVariants.WARNING}
              dismissible
              // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
              onDismiss={onDismissError}
            >
              {errorMessage}
            </Alert>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          </Stack>
        ) : (
          <Actions
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            loading={loading}
            activeProductionName={activeProductionName}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            onClickAdd={onClickAdd}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            onClickDelete={onClickDelete}
            shouldDisableDeleteButton={shouldDisableDeleteButton}
          />
        )}
      </Stack>
      {loading ? (
        <Spinner marginTop={4} />
      ) : events.length === 0 ? (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Text> {t('productions.overview.no_events')}</Text>
      ) : (
        <Panel key="panel">
          <List>
            {events.map((event, index) => (
              <Event
                key={event.id}
                id={event.id}
                name={
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  event.name?.[i18n.language] ??
                  event.name?.[event.mainLanguage]
                }
                terms={event.terms}
                location={
                  event.location?.name?.[i18n.language] ??
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  event.location?.name?.[event.location?.mainLanguage]
                }
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                calendarType={event.calendarType}
                onToggle={onToggleSelectEvent}
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                selected={event.selected}
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                css={
                  // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                  index !== events.length - 1
                    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    ? (props) => {
                        return `border-bottom: 1px solid ${getValue(
                          'borderColor',
                        )(props)};`;
                      }
                    : undefined
                }
              />
            ))}
          </List>
        </Panel>
      )}
    </Stack>
  );
};

Events.propTypes = {
  ...stackPropTypes,
  events: PropTypes.array,
  activeProductionName: PropTypes.string,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onToggleSelectEvent: PropTypes.func,
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: any; id: any; name: any; terms: any; ... Remove this comment to see the full error message
  selectedIds: PropTypes.array,
  // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
  onClickDelete: PropTypes.func,
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'props' implicitly has an 'any' type.
  onClickAdd: PropTypes.func,
  onAddEvent: PropTypes.func,
  onInputSearchTerm: PropTypes.func,
  onDismissError: PropTypes.func,
  onToBeAddedEventIdInput: PropTypes.func,
  toBeAddedEventId: PropTypes.string,
  isAddActionVisible: PropTypes.bool,
  className: PropTypes.string,
};

Events.defaultProps = {
  events: [],
  loading: false,
};

export { Events };
