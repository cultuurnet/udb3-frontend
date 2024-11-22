import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OwnershipRequest, OwnershipState } from '@/hooks/api/ownerships';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
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
        onClick={() => onDelete(request)}
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
          onClick={() => onApprove(request)}
        >
          {t('organizers.ownerships.table.actions.approve')}
        </Button>
        <Button
          variant={ButtonVariants.DANGER}
          iconName={Icons.TIMES_CIRCLE}
          spacing={3}
          onClick={() => onReject(request)}
        >
          {t('organizers.ownerships.table.actions.reject')}
        </Button>
      </Inline>
    );
  }

  return null;
};

type Props = {
  requests: OwnershipRequest[];
  shouldShowItemId?: boolean;
} & ActionHandlers;

export const OwnershipsTable = ({
  requests,
  onDelete,
  onApprove,
  onReject,
  shouldShowItemId = false,
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

  return (
    <Stack
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
          grid-template-columns: 1fr 1fr 18rem;
          border-bottom: 1px solid ${grey3};
        `}
      >
        <Title size={3}>{t('organizers.ownerships.table.user')}</Title>
        {shouldShowItemId && <Title size={3}>item id</Title>}
        {hasActions && (
          <Title size={3}>
            {t('organizers.ownerships.table.actions.title')}
          </Title>
        )}
      </Inline>
      <List>
        {requests.map((request) => (
          <Inline
            key={request.id}
            alignItems="center"
            paddingY={3}
            display="grid"
            css={`
              grid-template-columns: 1fr 1fr 18rem;

              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
            `}
          >
            <List.Item>{request.ownerEmail}</List.Item>
            {shouldShowItemId && <List.Item>{request.itemId}</List.Item>}
            {hasActions && (
              <List.Item>
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
