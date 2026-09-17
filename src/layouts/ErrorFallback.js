import * as Sentry from '@sentry/nextjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon, Icons, IconVariants } from '@/ui/Icon';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';

const MailToSupportLink = () => {
  const { t } = useTranslation();
  return <Link href={`mailto:${t('error.email')}`}>{t('error.email')}</Link>;
};

const ErrorFallback = ({ error }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <Stack
      textAlign="center"
      alignItems="center"
      marginY={6}
      spacing={3}
      flex={1}
      height="100vh"
    >
      <Icon
        name={Icons.EXCLAMATION_TRIANGLE}
        width={160}
        height={160}
        variant={IconVariants.DANGER}
      />
      <Text maxWidth={550}>
        <Trans
          i18nKey={'error.description'}
          components={{
            1: <MailToSupportLink />,
          }}
        ></Trans>
      </Text>
    </Stack>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
};

export { ErrorFallback };
