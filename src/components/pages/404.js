import { useTranslation } from 'react-i18next';

import { Icon, Icons } from '@/ui/Icon';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getValue = getValueFromTheme('pageNotFound');

const PageNotFound = () => {
  const { t } = useTranslation();

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
        name={Icons.BINOCULARS}
        width="10rem"
        height="auto"
        color={getValue('iconColor')}
      />
      <Title size={1}>{t('404.title')}</Title>
      <Title size={2}>{t('404.sub_title')}</Title>
      <Link href="/dashboard" width="max-content">
        {t('404.redirect')}
      </Link>
    </Stack>
  );
};

export default PageNotFound;
