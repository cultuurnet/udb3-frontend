import { useTranslation } from 'react-i18next';

import { OwnershipRequest } from '@/hooks/api/ownerships';
import { Inline } from '@/ui/Inline';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

type Props = {
  requests: OwnershipRequest[];
  actions: JSX.Element;
};

export const OwnershipsTable = ({ requests, actions }: Props) => {
  const getGlobalValue = getValueFromTheme('global');
  const { grey3 } = colors;
  const { t } = useTranslation();
  return (
    <Stack
      width="100%"
      flex={1}
      padding={4}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
        border-radius: 0.5rem;
        background-color: white;
        margin-bottom: 2rem;
      `}
    >
      <Inline
        justifyContent="space-between"
        css={`
          border-bottom: 1px solid ${grey3};
          padding-bottom: 0.5rem;
        `}
      >
        <Title size={3}>{t('organizers.ownerships.table.user')}</Title>
        <Title size={3}>{t('organizers.ownerships.table.actions.title')}</Title>
      </Inline>
      <List>
        {requests.map((request) => (
          <Inline
            key={request.id}
            justifyContent="space-between"
            alignItems="center"
            css={`
              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
              padding: 0.5rem 0;
            `}
          >
            <List.Item>{request.ownerEmail}</List.Item>
            <List.Item>{actions}</List.Item>
          </Inline>
        ))}
      </List>
    </Stack>
  );
};
