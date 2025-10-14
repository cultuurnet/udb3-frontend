import { useTranslation } from 'react-i18next';

import { Icon, Icons } from '@/ui/Icon';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Unauthorized = () => {
  const { t } = useTranslation();
  const getValue = getValueFromTheme('pageError');

  return (
    <Stack
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      spacing={3}
      flex={1}
      height="100vh"
    >
      <Icon
        name={Icons.EXCLAMATION_TRIANGLE}
        width="10rem"
        height="auto"
        color={getValue('iconColor')}
      />
      <Title size={1}>{t('unauthorized.title')}</Title>
      <Title size={2}>{t('unauthorized.sub_title')}</Title>
      <Link href="/dashboard" width="max-content">
        {t('unauthorized.redirect')}
      </Link>
    </Stack>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Unauthorized;
