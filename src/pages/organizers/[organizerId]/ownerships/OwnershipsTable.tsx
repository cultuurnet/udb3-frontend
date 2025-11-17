import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OwnershipCreator,
  OwnershipRequest,
  OwnershipState,
} from '@/hooks/api/ownerships';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getGlobalValue = getValueFromTheme('global');

type ActionHandlers = {
  onDelete?: (request: OwnershipRequest) => void;
  onApprove?: (request: OwnershipRequest) => void;
  onReject?: (request: OwnershipRequest) => void;
};

type ActionProps = {
  request: OwnershipRequest;
} & ActionHandlers;

const Actions = ({ request, onDelete, onApprove, onReject }: ActionProps) => {
  const { t } = useTranslation();

  if (request.state === OwnershipState.APPROVED) {
    return (
      <Button
        variant={ButtonVariants.ICON}
        iconName={Icons.TRASH}
        onClick={() => onDelete?.(request)}
      />
    );
  }

  if (request.state === OwnershipState.REQUESTED) {
    return (
      <Inline spacing={3}>
        <Button
          variant={ButtonVariants.SUCCESS}
          iconName={Icons.CHECK_CIRCLE}
          spacing={3}
          onClick={() => onApprove?.(request)}
        >
          {t('organizers.ownerships.table.actions.approve')}
        </Button>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TIMES_CIRCLE}
          spacing={3}
          onClick={() => onReject?.(request)}
        >
          {t('organizers.ownerships.table.actions.reject')}
        </Button>
      </Inline>
    );
  }

  return null;
};

const Status = ({ request }: { request: OwnershipRequest }) => {
  const { t } = useTranslation();

  if ('approvedDate' in request) {
    return (
      <Text fontSize="small">
        {t('organizers.ownerships.table.status.approved_by', {
          email: request.approvedByEmail,
          date: new Date(request.approvedDate).toLocaleString('nl-BE'),
        })}
      </Text>
    );
  }

  if ('rejectedDate' in request) {
    return (
      <Text fontSize="small">
        {t('organizers.ownerships.table.status.rejected_by', {
          email: request.rejectedByEmail,
          date: new Date(request.rejectedDate).toLocaleString('nl-BE'),
        })}
      </Text>
    );
  }
  return (
    <Text fontSize="small">
      {t(`organizers.ownerships.table.status.${request.state}`)}
    </Text>
  );
};

type Props = {
  requests: OwnershipRequest[];
  creator?: OwnershipCreator;
  shouldShowItemId?: boolean;
  shouldShowOwnerId?: boolean;
} & ActionHandlers;

export const OwnershipsTable = ({
  requests,
  creator,
  onDelete,
  onApprove,
  onReject,
  shouldShowItemId = false,
  shouldShowOwnerId = false,
}: Props) => {
  const { grey3 } = colors;
  const { t } = useTranslation();
  const router = useRouter();

  const hasActions = useMemo(
    () =>
      requests.some(
        (request) =>
          request.state !== OwnershipState.DELETED &&
          request.state !== OwnershipState.REJECTED,
      ),
    [requests],
  );

  const hasStatus = useMemo(
    () =>
      requests.some(
        (request) =>
          request.state === OwnershipState.APPROVED ||
          request.state === OwnershipState.REJECTED,
      ),
    [requests],
  );

  const isOnManagePage = router.pathname.startsWith('/manage');

  const hasDate =
    isOnManagePage &&
    requests.some((request) => request.state === OwnershipState.REQUESTED) &&
    requests.some((request) => !!request.created);

  const gridTemplateColumns = useMemo(() => {
    const columns = ['2fr'];

    if (shouldShowItemId) {
      columns.push('1.5fr');
    }

    if (hasStatus) {
      columns.push('1fr');
    }

    if (hasDate) {
      columns.push('1.5fr');
    }

    if (hasActions) {
      columns.push('1.5fr');
    }

    return columns.join(' ');
  }, [hasStatus, shouldShowItemId, hasDate, hasActions]);

  return (
    <Stack
      role="table"
      flex={1}
      padding={4}
      marginBottom={5}
      borderRadius="0.5rem"
      backgroundColor="white"
      maxWidth="85rem"
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
    >
      <Inline
        paddingBottom={3}
        display="grid"
        alignItems="center"
        css={`
          grid-template-columns: ${gridTemplateColumns};
          gap: 1rem;
          border-bottom: 1px solid ${grey3};
        `}
      >
        <Title size={3}>{t('organizers.ownerships.table.user')}</Title>
        {shouldShowItemId && <Title size={3}>Item id</Title>}
        {hasStatus && <Title size={3}>Status</Title>}
        {hasDate && (
          <Inline spacing={2} alignItems="center">
            <Title size={3}>Aanvraag Datum</Title>
          </Inline>
        )}
        {hasActions && (
          <Title size={3} justifyContent="flex-start">
            {t('organizers.ownerships.table.actions.title')}
          </Title>
        )}
      </Inline>
      <List paddingY={3}>
        {creator?.email && (
          <Inline
            role="row"
            alignItems="center"
            paddingY={3}
            minHeight="4rem"
            display="grid"
            css={`
              grid-template-columns: ${gridTemplateColumns};
              gap: 1rem;
              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
            `}
          >
            <List.Item>{creator.email}</List.Item>
          </Inline>
        )}
        {requests.map((request) => (
          <Inline
            key={request.id}
            role="row"
            alignItems="center"
            paddingY={3}
            minHeight="4rem"
            display="grid"
            css={`
              grid-template-columns: ${gridTemplateColumns};
              gap: 1rem;
              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
            `}
          >
            <List.Item minWidth={0}>
              <Stack>
                {shouldShowOwnerId && <Text>{request.ownerId}</Text>}
                <Text>{request.ownerEmail}</Text>
              </Stack>
            </List.Item>
            {shouldShowItemId && (
              <List.Item minWidth={0}>
                <Stack>
                  <Link href={`/organizers/${request.itemId}/preview`}>
                    {request.itemId}
                  </Link>
                </Stack>
              </List.Item>
            )}
            {hasStatus && (
              <List.Item minWidth={0}>
                <Status request={request} />
              </List.Item>
            )}
            {hasDate && (
              <List.Item minWidth={0}>{request.created || ''}</List.Item>
            )}
            {hasActions && (
              <List.Item
                minWidth={0}
                display="flex"
                justifyContent={isOnManagePage ? 'flex-end' : 'flex-start'}
              >
                <Actions
                  request={request}
                  onDelete={onDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </List.Item>
            )}
          </Inline>
        ))}
      </List>
    </Stack>
  );
};
