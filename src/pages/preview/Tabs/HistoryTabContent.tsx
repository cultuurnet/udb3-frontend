import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { OfferHistory } from '@/types/Offer';
import { List } from '@/ui/List';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
type Props = {
  offerHistory: OfferHistory[];
};

const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm');
const getGlobalValue = getValueFromTheme('global');
const { udbMainLightGrey, white } = colors;

const HistoryTabContent = ({ offerHistory }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack
      marginTop={5}
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};

        ul {
          position: relative;
          padding-left: 40px;
        }

        ul:before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 2px;
          content: '';
          background-color: ${udbMainLightGrey};
        }

        li {
          position: relative;
        }

        li:before {
          position: absolute;
          left: -24px;
          top: 9px;
          display: block;
          border: 1px solid ${white};
          background-color: ${udbMainLightGrey};
          border-radius: 50%;
          width: 9px;
          height: 9px;
          content: '';
        }
      `}
    >
      <List spacing={3}>
        {offerHistory.map((history, index) => (
          <List.Item key={index} flexDirection="column" alignItems="flex-start">
            <Text fontWeight="bold">{formatDate(history.date)}</Text>
            {history.author && <Text>{history.author}</Text>}
            <Text>{history.description}</Text>
            {history.api && (
              <Text>{t('preview.history_tab.api', { api: history.api })}</Text>
            )}
            {history.apiKey && <Text>{history.apiKey}</Text>}
            {history.clientId && (
              <Text>
                {t('preview.history_tab.client_id', {
                  clientId: history.clientId,
                })}
              </Text>
            )}
            {history.clientName && (
              <Text>
                {t('preview.history_tab.client_name', {
                  clientName: history.clientName,
                })}
              </Text>
            )}
          </List.Item>
        ))}
      </List>
    </Stack>
  );
};

export { HistoryTabContent };
