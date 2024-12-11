import { useTranslation } from 'react-i18next';

import { OwnershipCreator, OwnershipRequest } from '@/hooks/api/ownerships';
import { Inline } from '@/ui/Inline';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

type Props = {
  creator?: OwnershipCreator;
  requests: OwnershipRequest[];
  renderActions: (request: OwnershipRequest) => JSX.Element;
};

const getGlobalValue = getValueFromTheme('global');

export const OwnershipsTable = ({
  creator,
  requests,
  renderActions,
}: Props) => {
  const { grey3 } = colors;
  const { t } = useTranslation();
  return (
    <Stack
      role="table"
      flex={1}
      padding={4}
      marginBottom={5}
      borderRadius="0.5rem"
      backgroundColor="white"
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
    >
      <Inline
        justifyContent="space-between"
        paddingBottom={3}
        css={`
          border-bottom: 1px solid ${grey3};
        `}
      >
        <Title size={3}>{t('organizers.ownerships.table.user')}</Title>
        <Title size={3}>{t('organizers.ownerships.table.actions.title')}</Title>
      </Inline>
      <List paddingY={3}>
        {creator && <List.Item>{creator.email}</List.Item>}
        {requests.map((request) => (
          <Inline
            key={request.id}
            role="row"
            justifyContent="space-between"
            alignItems="center"
            css={`
              &:not(:last-child) {
                border-bottom: 1px solid ${grey3};
              }
            `}
          >
            <List.Item>{request.ownerEmail}</List.Item>
            <List.Item>{renderActions(request)}</List.Item>
          </Inline>
        ))}
      </List>
    </Stack>
  );
};
