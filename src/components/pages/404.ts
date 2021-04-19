// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { Stack } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Title' or its correspondi... Remove this comment to see the full error message
import { Title } from '@/ui/Title';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Link' or its correspondin... Remove this comment to see the full error message
import { Link } from '@/ui/Link';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Icon' or its correspondin... Remove this comment to see the full error message
import { Icon, Icons } from '@/ui/Icon';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/theme' or its correspondi... Remove this comment to see the full error message
import { getValueFromTheme } from '@/ui/theme';
import { useTranslation } from 'react-i18next';

const getValue = getValueFromTheme('pageNotFound');

const PageNotFound = () => {
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
        name={Icons.BINOCULARS}
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'width'.
        width="10rem"
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'height'.
        height="auto"
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'color'.
        color={getValue('iconColor')}
      />
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'size'.
      <Title size={1}>{t('404.title')}</Title>
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'size'.
      <Title size={2}>{t('404.sub_title')}</Title>
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'href'.
      <Link href="/dashboard" width="max-content">
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
        {t('404.redirect')}
      </Link>
    </Stack>
  );
};

export default PageNotFound;
