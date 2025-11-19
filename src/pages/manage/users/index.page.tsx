import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useFindUserWithEmailQuery } from '@/hooks/api/user';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { ErrorBody } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const schema = yup.object({
  email: yup.string().email().required(),
});

type FormData = yup.InferType<typeof schema>;

const UsersOverviewPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'loading' | 'notFound' | 'problem'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isReactUsersEditFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_USERS_EDIT,
  );

  const [searchEmail, setSearchEmail] = useState('');

  const { register, handleSubmit, formState, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const email = watch('email');

  const findUserQuery = useFindUserWithEmailQuery(searchEmail, {
    enabled: !!searchEmail && searchEmail.includes('@'),
    retry: false,
  });

  useEffect(() => {
    if (findUserQuery.isSuccess && findUserQuery.data) {
      console.log('User found:', findUserQuery.data);
      if (isReactUsersEditFeatureFlagEnabled) {
        router.push(`/manage/users/${findUserQuery.data.uuid}/edit`);
      } else {
        router.push(`/manage/users/${findUserQuery.data.email}`);
      }
    } else if (findUserQuery.isError && findUserQuery.error) {
      setSearchEmail('');
      if (findUserQuery.error.status === 404) {
        setSearchStatus('notFound');
      } else {
        const errorBody = (findUserQuery.error.body ?? {}) as ErrorBody;
        setSearchStatus('problem');
        setErrorMessage(
          errorBody.detail ||
            errorBody.title ||
            findUserQuery.error.message ||
            t('users.search.error.unknown'),
        );
      }
    }
  }, [findUserQuery, router, t]);

  const onSubmit = async (data: FormData) => {
    setSearchStatus('loading');
    setErrorMessage('');
    setSearchEmail(data.email.trim());
  };

  const handleInputChange = () => {
    if (searchStatus === 'problem' || searchStatus === 'notFound') {
      setSearchStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <Page>
      <Page.Title>{t('users.search.title')}</Page.Title>
      <Page.Content spacing={5}>
        <Stack spacing={4}>
          <Stack spacing={4}>
            <FormElement
              id="user-search-input"
              label={t('users.search.email.label')}
              labelPosition="left"
              alignItems={'start'}
              Component={
                <Input
                  {...register('email')}
                  placeholder={t('users.search.email.placeholder')}
                  onChange={(e) => {
                    register('email').onChange(e);
                    handleInputChange();
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      email.trim() &&
                      email.includes('@')
                    ) {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  disabled={findUserQuery.isLoading}
                />
              }
              error={formState.errors.email?.message}
            />
          </Stack>

          {searchStatus === 'idle' && (
            <Alert variant={AlertVariants.PRIMARY} fullWidth={true}>
              {t('users.search.info')}
            </Alert>
          )}

          {searchStatus === 'notFound' && (
            <Alert variant={AlertVariants.WARNING} fullWidth={true}>
              {t('users.search.not_found')}
            </Alert>
          )}

          {searchStatus === 'problem' && (
            <Alert variant={AlertVariants.WARNING} fullWidth={true}>
              {t('users.search.error.message', { error: errorMessage })}
            </Alert>
          )}
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ cookies }) => {
    return {
      props: {
        cookies,
      },
    };
  },
);

export default UsersOverviewPage;
