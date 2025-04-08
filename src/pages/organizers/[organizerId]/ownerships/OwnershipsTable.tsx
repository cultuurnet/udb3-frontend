import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OwnershipCreator,
  OwnershipRequest,
  OwnershipState,
} from '@/hooks/api/ownerships';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { formatDateToISO } from '@/utils/formatDateToISO';

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
          date: formatDateToISO(new Date(request.approvedDate)),
        })}
      </Text>
    );
  }

  if ('rejectedDate' in request) {
    return (
      <Text fontSize="small">
        {t('organizers.ownerships.table.status.rejected_by', {
          email: request.rejectedByEmail,
          date: formatDateToISO(new Date(request.rejectedDate)),
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

  const hasActions = useMemo(
    () =>
      !!requests.find(
        (it) =>
          it.state !== OwnershipState.DELETED &&
          it.state !== OwnershipState.REJECTED,
      ),
    [requests],
  );

  const colsAmount = useMemo(() => {
    let amount = 3;

    if (shouldShowItemId) {
      amount += 1;
    }

    return amount;
  }, [shouldShowItemId]);

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
        css={`
          display: grid;
          grid-template-columns: repeat(${colsAmount}, 1fr);
          border-bottom: 1px solid ${grey3};
        `}
      >
        <Title size={3}>{t('organizers.ownerships.table.user')}</Title>
        {shouldShowItemId && <Title size={3}>Item id</Title>}
        <Title size={3}>Status</Title>
        {hasActions && (
          <Title size={3} justifyContent="flex-end">
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
            css={`
              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
            `}
          >
            <List.Item>{creator.email}</List.Item>
          </Inline>
        )}
        {requests.map((request) => {
          return (
            <Inline
              key={request.id}
              role="row"
              alignItems="center"
              paddingY={3}
              display="grid"
              minHeight="4rem"
              css={`
                grid-template-columns: repeat(${colsAmount}, 1fr);

                &:not(:last-child) {
                  border-bottom: 1px solid ${grey3};
                }
              `}
            >
              <List.Item>
                <Stack>
                  {shouldShowOwnerId && <Text>{request.ownerId}</Text>}
                  <Text>{request.ownerEmail}</Text>
                </Stack>
              </List.Item>
              {shouldShowItemId && (
                <List.Item>
                  <Stack>
                    <Link href={`/organizers/${request.itemId}/preview`}>
                      {request.itemId}
                    </Link>
                  </Stack>
                </List.Item>
              )}
              <List.Item>
                <Status request={request} />
              </List.Item>
              {hasActions && (
                <List.Item justifyContent="flex-end">
                  <Actions
                    request={request}
                    onDelete={onDelete}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                </List.Item>
              )}
            </Inline>
          );
        })}
      </List>
    </Stack>
  );
};
