import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dehydrate } from 'react-query/hydration';

import {
  prefetchGetLabelByIdQuery,
  useCreateLabelMutation,
  useGetLabelByIdQuery,
  useIsLabelNameUnique,
  useUpdateLabelPrivacyMutation,
  useUpdateLabelVisibilityMutation,
} from '@/hooks/api/labels';
import { useHeaders } from '@/hooks/api/useHeaders';
import {
  prefetchGetPermissionsQuery,
  useGetPermissionsQuery,
} from '@/hooks/api/user';
import { PermissionTypes } from '@/layouts/Sidebar';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import LabelForm from '../labelForm';

const MAX_NAME = 255;
const MIN_NAME = 2;
const SEMICOLON_REGEX = /;/;

const LabelEditPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    labelId,
    success,
    name: successName,
  } = router.query as {
    labelId: string;
    success?: string;
    name?: string;
  };
  const headers = useHeaders();
  const permissionsQuery = useGetPermissionsQuery();
  const hasManageLabelsPermission = (permissionsQuery.data || []).includes(
    PermissionTypes.LABELS_BEHEREN,
  );

  const { data: label } = useGetLabelByIdQuery(
    { id: labelId },
    { enabled: !!labelId },
  );

  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle success message from query params (for newly created labels)
  useEffect(() => {
    if (success === 'created' && successName) {
      setSuccessMessage(
        t('labels.edit.success_created', {
          name: successName,
        }),
      );
      // Clean up the URL by removing query params
      router.replace(`/manage/labels/${labelId}/edit`, undefined, {
        shallow: true,
      });
    }
  }, [success, successName, labelId, router, t]);

  useEffect(() => {
    if (!label) return;
    setName(label.name || '');
    setIsVisible(label.visibility !== 'invisible');
    setIsPrivate(label.privacy === 'private');
  }, [label]);

  const { isUnique } = useIsLabelNameUnique({ name, currentName: label?.name });

  // Check if the name has been changed from the original.
  const nameChanged = label?.name && name.trim() !== label.name;

  const nameError = useMemo(() => {
    if (!nameChanged || !touched) return undefined;
    if (!name || name.trim().length === 0)
      return t('labels.form.errors.name_required');
    if (name.length < MIN_NAME)
      return t('labels.form.errors.name_min', { count: MIN_NAME });
    if (name.length > MAX_NAME)
      return t('labels.form.errors.name_max', { count: MAX_NAME });
    if (SEMICOLON_REGEX.test(name)) return t('labels.form.errors.semicolon');
    if (!isUnique) return t('labels.form.errors.name_unique');
    return undefined;
  }, [nameChanged, touched, name, isUnique, t]);

  const updateVisibilityMutation = useUpdateLabelVisibilityMutation();
  const updatePrivacyMutation = useUpdateLabelPrivacyMutation();
  const createLabelMutation = useCreateLabelMutation();

  const isSubmitting =
    updateVisibilityMutation.isLoading ||
    updatePrivacyMutation.isLoading ||
    createLabelMutation.isLoading;

  const handleSave = async () => {
    if (!label) return;
    setTouched(true);
    setSuccessMessage('');

    try {
      // Create a new label if the name is edited.
      if (nameChanged) {
        if (nameError) return;
        const response = await createLabelMutation.mutateAsync({
          headers,
          name: name.trim(),
          isVisible,
          isPrivate,
          parentId: labelId,
        });
        // Try to get the ID from response body or Location header
        let newLabelId = response.uuid;

        if ((newLabelId = response.uuid)) {
          router.push(
            `/manage/labels/${newLabelId}/edit?success=created&name=${encodeURIComponent(
              name.trim(),
            )}`,
          );
        } else {
          router.push('/manage/labels');
        }
        return;
      }

      // Otherwise, just update the flags.
      const visibilityChanged =
        (label.visibility !== 'invisible') !== isVisible;
      const privacyChanged = (label.privacy === 'private') !== isPrivate;
      if (visibilityChanged) {
        await updateVisibilityMutation.mutateAsync({
          headers,
          id: labelId,
          makeVisible: isVisible,
        });
      }
      if (privacyChanged) {
        await updatePrivacyMutation.mutateAsync({
          headers,
          id: labelId,
          makePrivate: isPrivate,
        });
      }

      setSuccessMessage(
        t('labels.edit.success_updated', {
          name: label.name,
        }),
      );
    } catch (error) {
      // Error handling is managed by the mutation hooks
    }
  };

  if (!hasManageLabelsPermission) {
    return (
      <Page>
        <Page.Title>{t('labels.edit.title', 'Edit label')}</Page.Title>
        <Page.Content>
          <Text>{t('errors.forbidden', 'You do not have access.')}</Text>
        </Page.Content>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Title>{t('labels.edit.title', 'Edit label')}</Page.Title>
      <Page.Content>
        <Stack spacing={4}>
          {successMessage && (
            <Alert variant={AlertVariants.SUCCESS} fullWidth>
              {successMessage}
            </Alert>
          )}
          <LabelForm
            mode="edit"
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
            nameChanged={nameChanged}
            onSave={handleSave}
            onCancel={() => router.push('/manage/labels')}
          />
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { labelId } = query as { labelId: string };

    await Promise.all([
      prefetchGetPermissionsQuery({ req, queryClient }),
      labelId
        ? prefetchGetLabelByIdQuery({ req, queryClient, id: labelId })
        : Promise.resolve(),
    ]);

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelEditPage;
