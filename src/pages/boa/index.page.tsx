import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Paragraph, ParagraphVariants } from '@/ui/Paragraph';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Boa = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [, setBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  const handleStartTesting = () => {
    setBoaEnabled(true);
    router.push('/create?scope=events');
  };

  return (
    <Stack
      flex={1}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      padding={5}
    >
      <Stack spacing={4} maxWidth="35rem" width="100%">
        <Title size={1} justifyContent="center">
          {t('boa.title')}
        </Title>
        <Stack spacing={5}>
          <Paragraph>{t('boa.paragraph1')}</Paragraph>
          <Paragraph variant={ParagraphVariants.MUTED}>
            {t('boa.paragraph2')}
          </Paragraph>
        </Stack>
        <Inline justifyContent="center">
          <Button variant={ButtonVariants.SUCCESS} onClick={handleStartTesting}>
            {t('boa.button')}
          </Button>
        </Inline>
      </Stack>
    </Stack>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Boa;
