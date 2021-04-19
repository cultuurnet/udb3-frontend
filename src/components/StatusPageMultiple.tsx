import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChangeStatusSubEvents } from '@/hooks/api/events';
import { formatPeriod } from '@/utils/formatPeriod';
import { parseOfferId } from '@/utils/parseOfferId';
import { Alert } from '@/ui/Alert';
import { Page } from '@/ui/Page';
import { SelectionTable } from '@/ui/SelectionTable';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { StatusModal } from './StatusModal';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import camelCase from 'lodash/camelCase';
import { Icons } from '@/ui/Icon';
import { Link, LinkVariants } from '@/ui/Link';
import { OfferStatus } from '@/constants/OfferStatus';

const getValue = getValueFromTheme('statusPage');

const Status = ({ type, reason }) => {
  const { i18n } = useTranslation();
  return (
    <Stack>
      <Text>{type}</Text>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      {!!reason?.[i18n.language] && (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Text color={getValue('infoTextColor')}>{reason[i18n.language]}</Text>
      )}
    </Stack>
  );
};

Status.propTypes = {
  type: PropTypes.string.isRequired,
  reason: PropTypes.object,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'refetchEvent' does not exist on type 'St... Remove this comment to see the full error message
const StatusPageMultiple = ({ event, refetchEvent }) => {
  const { t, i18n } = useTranslation();

  const eventId = parseOfferId(event['@id']);
  const name =
    event?.name?.[i18n.language] ?? event?.name?.[event.mainLanguage];
  const subEvents = event?.subEvent;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const selectedSubEventIds = useMemo(() => selectedRows.map((row) => row.id), [
    selectedRows,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'never'.
  ]);

  const handleSuccess = async () => {
    await refetchEvent();
    setIsModalVisible(false);
  };

  const changeSubEventsMutation = useChangeStatusSubEvents({
    onSuccess: handleSuccess,
  });

  const handleConfirmChangeStatus = async (type, reason) =>
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'type' implicitly has an 'any' type.
    changeSubEventsMutation.mutate({
      eventId,
      subEventIds: selectedSubEventIds,
      subEvents,
      type,
      reason:
        reason.length > 0 && type !== OfferStatus.AVAILABLE
          ? {
              [i18n.language]: reason,
            }
          : undefined,
    });

  const columns = useMemo(
    () => [
      {
        Header: t('offerStatus.period'),
        accessor: 'period',
      },
      {
        Header: t('offerStatus.statusLabel'),
        accessor: 'status',
      },
    ],
    [],
  );

  const data = useMemo(
    () =>
      subEvents.map((subEvent) => ({
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'subEvent' implicitly has an 'any' type.
        period: formatPeriod(
          subEvent.startDate,
          subEvent.endDate,
          i18n.language,
          t,
        ),
        status: (
          <Status
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            type={t(
              `offerStatus.status.event.${camelCase(subEvent.status.type)}`,
            )}
            reason={subEvent.status.reason}
          />
        ),
      })),
    [subEvents],
  );

  return [
    <Page key="page">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Page.Title>{t('offerStatus.title', { name })}</Page.Title>
      <Page.Content spacing={5}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Alert>{t('offerStatus.info')}</Alert>
        <SelectionTable
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          columns={columns}
          data={data}
          onSelectionChanged={setSelectedRows}
          actions={[
            {
              iconName: Icons.PENCIL,
              title: t('offerStatus.changeStatus'),
              onClick: () => setIsModalVisible(true),
              disabled: selectedRows.length === 0,
            },
          ]}
          translateSelectedRowCount={(count) =>
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'count' implicitly has an 'any' type.
            t('selectionTable.rowsSelectedCount', {
              count,
            })
          }
        />
        <Link
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          href={`/event/${eventId}/preview`}
          variant={LinkVariants.BUTTON_SUCCESS}
        >
          {t('offerStatus.modificationReady')}
        </Link>
      </Page.Content>
    </Page>,
    <StatusModal
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      key="modal"
      visible={isModalVisible}
      loading={changeSubEventsMutation.status === QueryStatus.LOADING}
      onConfirm={handleConfirmChangeStatus}
      onClose={() => setIsModalVisible(false)}
    />,
  ];
};

StatusPageMultiple.propTypes = {
  event: PropTypes.object.isRequired,
};

export { StatusPageMultiple };
