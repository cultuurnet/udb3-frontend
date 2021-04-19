import PropTypes from 'prop-types';
import { Icon, Icons } from '@/ui/Icon';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';
import { getValueFromTheme } from '@/ui/theme';
import { Text } from '@/ui/Text';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@/ui/Link';

const getValue = getValueFromTheme('pageError');

const MailToSupportLink = () => {
  const { t } = useTranslation();
  return (
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'href'.
    <Link href={`mailto:${t('error.email')}`} css="display: inline">
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter '(Missing)'
      implicitly has an 'any' type... Remove this comment to see the full error
      message
      {t('error.email')}
    </Link>
  );
};

const ErrorFallback = ({ error }) => {
  const { t } = useTranslation();

  return (
    <Stack
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'textAlign'.
      textAlign="center"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'alignItems'.
      alignItems="center"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'marginY'.
      marginY={6}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
      spacing={3}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'flex'.
      flex={1}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'height'.
      height="100vh"
    >
      <Icon
        name={Icons.EXCLAMATION_TRIANGLE}
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'width'.
        width="10rem"
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'height'.
        height="auto"
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'color'.
        color={getValue('iconColor')}
      />
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'size'.
      <Title size={1}>{t('error.title')}</Title>
      {error && (
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'size'.
        <Title size={2}>
          {error.name}: {error.message}
        </Title>
      )}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'maxWidth'.
      <Text maxWidth={550}>
        // @ts-expect-error ts-migrate(2749) FIXME: 'Trans' refers to a value,
        but is being used as a ... Remove this comment to see the full error
        message
        <Trans i18nKey="error.description">
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Er'. Er
          ging iets mis. Herlaad de pagina om opnieuw te proberen. Neem //
          @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'contact'.
          contact op met <MailToSupportLink /> als dit probleem zich blijft //
          @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'blijft'.
          voordoen
        </Trans>
      </Text>
    </Stack>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
};

export { ErrorFallback };
