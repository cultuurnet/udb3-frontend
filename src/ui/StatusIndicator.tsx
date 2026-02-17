import { useTranslation } from 'react-i18next';

import { Box } from '@/ui/Box';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';

export type PublicationStatusIndicatorProps = InlineProps & {
  color?: string;
  label?: string;
  isExternalCreator?: boolean;
};

export const StatusIndicator = ({
  color,
  label,
  isExternalCreator,
  ...props
}: PublicationStatusIndicatorProps) => {
  const { t } = useTranslation();

  return (
    <Stack>
      <Inline
        marginBottom={1}
        spacing={3}
        alignItems="center"
        {...getInlineProps(props)}
      >
        {color &&
          label && [
            <Box
              key="status-indicator-box"
              width="0.90rem"
              height="0.90rem"
              backgroundColor={color}
              borderRadius="50%"
              flexShrink={0}
            />,
            <Text key="status-indicator-label" variant={TextVariants.MUTED}>
              {label}
            </Text>,
          ]}
      </Inline>
      {isExternalCreator && (
        <Text variant={TextVariants.MUTED}>
          {t('dashboard.external_creator')}
        </Text>
      )}
    </Stack>
  );
};
