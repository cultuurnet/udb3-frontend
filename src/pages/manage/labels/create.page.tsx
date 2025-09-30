import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dehydrate } from 'react-query/hydration';

import {
  useCreateLabelMutation,
  useIsLabelNameUnique,
} from '@/hooks/api/labels';
import { useHeaders } from '@/hooks/api/useHeaders';
import {
  prefetchGetPermissionsQuery,
  useGetPermissionsQuery,
} from '@/hooks/api/user';
import { PermissionTypes } from '@/layouts/Sidebar';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import LabelForm from './labelForm';

const MAX_NAME = 255;
const MIN_NAME = 2;
const SEMICOLON_REGEX = /;/;

const LabelsCreatePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const headers = useHeaders();
  const createLabelMutation = useCreateLabelMutation();
  const permissionsQuery = useGetPermissionsQuery();
  const hasManageLabelsPermission = (permissionsQuery.data || []).includes(
    PermissionTypes.LABELS_BEHEREN,
  );

  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [touched, setTouched] = useState(false);

  const { isUnique } = useIsLabelNameUnique({ name });

  const nameError = useMemo(() => {
    if (!touched) return undefined;
    if (!name || name.trim().length === 0)
      return t('labels.form.errors.name_required');
    if (name.length < MIN_NAME)
      return t('labels.form.errors.name_min', { count: MIN_NAME });
    if (name.length > MAX_NAME)
      return t('labels.form.errors.name_max', { count: MAX_NAME });
    if (SEMICOLON_REGEX.test(name)) return t('labels.form.errors.semicolon');
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
        {!hasManageLabelsPermission && (
          <Stack>
            <Text>{t('errors.forbidden', 'You do not have access.')}</Text>
          </Stack>
        )}
        {hasManageLabelsPermission && (
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
        )}
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, queryClient, cookies }) => {
    await prefetchGetPermissionsQuery({ req, queryClient });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelsCreatePage;
