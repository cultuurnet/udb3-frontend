import { dehydrate } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import Router, { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from 'types/Offer';

import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  prefetchGetLabelsQuery,
  useGetLabelsByQuery,
} from '@/hooks/api/labels';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Link } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const labelsPerPage = 10;
const getGlobalValue = getValueFromTheme('global');

const LabelsOverviewPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [currentPageLabels, setCurrentPageLabels] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [isReactLabelsCreateEditFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_LABELS_CREATE_EDIT,
  );

  useEffect(() => {
    if (router.query.success === 'created') {
      const labelName = router.query.name as string;
      setSuccessMessage(
        t('labels.overview.success_created', { name: labelName }),
      );
      router.replace('/manage/labels', undefined, {
        shallow: true,
      });
    }
  }, [router, t]);

  const labelsToTableData = (labels: Label[]) =>
    labels.map((label) => ({
      name: label.name,
      invisible: label.visibility,
      private: label.privacy,
      excluded: label.excluded,
      options: label.uuid,
    }));

  const labelsQuery = useGetLabelsByQuery({
    name: searchInput,
    paginationOptions: {
      start: (currentPageLabels - 1) * labelsPerPage,
      limit: labelsPerPage,
    },
  });
  const totalItemsLabels = labelsQuery.data?.totalItems ?? 0;
  const actions = [
    {
      iconName: Icons.PLUS,
      title: t('labels.overview.create'),
      onClick: () => Router.push('/manage/labels/create'),
      disabled: false,
    },
  ];
  const columns = useMemo(
    () => [
      {
        Header: t('labels.overview.table.name'),
        accessor: 'name',
        Cell: ({ cell }) => <Text>{cell.value}</Text>,
      },
      {
        Header: t('labels.overview.table.invisible'),
        accessor: 'invisible',
        Cell: ({ cell }) =>
          cell.value === 'invisible' && (
            <Text>{t('labels.overview.table.invisible')}</Text>
          ),
      },
      {
        Header: t('labels.overview.table.private'),
        accessor: 'private',
        Cell: ({ cell }) =>
          cell.value === 'private' && (
            <Text>{t('labels.overview.table.private')}</Text>
          ),
      },
      {
        Header: t('labels.overview.table.excluded'),
        accessor: 'excluded',
        Cell: ({ cell }) =>
          cell.value === true && (
            <Text>{t('labels.overview.table.excluded')}</Text>
          ),
      },
      {
        Header: t('labels.overview.table.options'),
        accessor: 'options',
        Cell: ({ cell }) =>
          isReactLabelsCreateEditFeatureFlagEnabled ? (
            <Link href={`/manage/labels/${cell.value}/edit`}>
              {t('labels.overview.table.edit')}
            </Link>
          ) : (
            <Link href={`/manage/labels/${cell.value}`}>
              {t('labels.overview.table.edit')}
            </Link>
          ),
      },
    ],
    [t, isReactLabelsCreateEditFeatureFlagEnabled],
  );
  const labels: Label[] = useMemo(
    () => labelsQuery.data?.member ?? [],
    [labelsQuery.data?.member],
  );

  const handleInputSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const searchTerm: string = event.target.value.toString().trim();
      setCurrentPageLabels(1);
      setSearchInput(searchTerm);
    },
    [],
  );

  return (
    <Page>
      <Page.Title>{t('labels.overview.title')}</Page.Title>
      <Page.Content spacing={5}>
        <Stack spacing={4}>
          <FormElement
            id="labels-overview-search"
            label={t('labels.overview.search.label')}
            Component={
              <Input
                placeholder={t('labels.overview.search.placeholder')}
                onChange={debounce(handleInputSearch, 275)}
              />
            }
          />
          {successMessage && (
            <Alert variant={AlertVariants.SUCCESS} fullWidth={true}>
              {successMessage}
            </Alert>
          )}
          {labelsQuery.status === QueryStatus.SUCCESS &&
            labels.length === 0 && (
              <Alert variant={AlertVariants.WARNING} fullWidth={true}>
                {t('labels.overview.no_results')}
              </Alert>
            )}
          {labelsQuery.status === QueryStatus.ERROR && (
            <Alert variant={AlertVariants.WARNING} fullWidth={true}>
              {t('labels.overview.something_wrong') +
                ' ' +
                labelsQuery.error?.message}
            </Alert>
          )}
        </Stack>

        <Stack
          backgroundColor="white"
          padding={4}
          borderRadius={getGlobalBorderRadius}
          spacing={4}
          css={`
            box-shadow: ${getGlobalValue('boxShadow.medium')};
          `}
        >
          <Inline alignItems="center" spacing={5}>
            <Inline spacing={3}>
              {actions.map(({ iconName, title, onClick, disabled }) => (
                <Button
                  key={title}
                  variant={ButtonVariants.PRIMARY}
                  onClick={onClick}
                  disabled={disabled}
                  iconName={iconName}
                  spacing={3}
                >
                  {title}
                </Button>
              ))}
            </Inline>
          </Inline>
          {labelsQuery.status === QueryStatus.LOADING && <Spinner />}
          {labelsQuery.status === QueryStatus.SUCCESS && labels.length > 0 && (
            <Inline spacing={5}>
              <Table columns={columns} data={labelsToTableData(labels)} />
            </Inline>
          )}
        </Stack>

        <Pagination
          currentPage={currentPageLabels}
          totalItems={totalItemsLabels}
          perPage={labelsPerPage}
          onChangePage={setCurrentPageLabels}
        />
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, cookies, queryClient }) => {
    await prefetchGetLabelsQuery({
      req,
      queryClient,
      paginationOptions: { limit: labelsPerPage, start: 0 },
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelsOverviewPage;
