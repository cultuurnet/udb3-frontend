import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dehydrate } from 'react-query/hydration';

import {
  useCreateLabelMutation,
  useIsLabelNameUnique,
} from '@/hooks/api/labels';
import { useHeaders } from '@/hooks/api/useHeaders';
import { LabelValidationInformation } from '@/types/Offer';
import { Page } from '@/ui/Page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import LabelForm from './labelForm';

const LabelsCreatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const headers = useHeaders();
  const createLabelMutation = useCreateLabelMutation();

  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [touched, setTouched] = useState(false);

  const { isUnique } = useIsLabelNameUnique({ name });

  const nameError = useMemo(() => {
    if (!touched) return undefined;
    if (!name || name.trim().length === 0)
      return t('labels.form.errors.name_required');
    if (name.length < LabelValidationInformation.MIN_LENGTH)
      return t('labels.form.errors.name_min', {
        count: LabelValidationInformation.MIN_LENGTH,
      });
    if (name.length > LabelValidationInformation.MAX_LENGTH)
      return t('labels.form.errors.name_max', {
        count: LabelValidationInformation.MAX_LENGTH,
      });
    if (LabelValidationInformation.SEMICOLON_REGEX.test(name))
      return t('labels.form.errors.semicolon');
    if (!isUnique) return t('labels.form.errors.name_unique');
    return undefined;
  }, [touched, name, isUnique, t]);

  const isSubmitting = createLabelMutation.isLoading;
  const handleCreate = async () => {
    setTouched(true);
    if (nameError) return;
    await createLabelMutation.mutateAsync({
      headers,
      name: name.trim(),
      isVisible,
      isPrivate,
    });
    router.push('/manage/labels');
  };

  return (
    <Page>
      <Page.Title>{t('labels.create.title', 'Create label')}</Page.Title>
      <Page.Content>
        <LabelForm
          mode="create"
          name={name}
          setName={setName}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          nameError={nameError}
          touched={touched}
          setTouched={setTouched}
          isSubmitting={isSubmitting}
          onCreateRenamed={handleCreate}
          onCancel={() => router.push('/manage/labels')}
        />
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ queryClient, cookies }) => {
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelsCreatePage;
