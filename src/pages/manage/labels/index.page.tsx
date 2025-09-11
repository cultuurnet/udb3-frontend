import debounce from 'lodash/debounce';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dehydrate } from 'react-query/hydration';
import { Label } from 'types/Offer';

import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  labelsToTableData,
  prefetchGetLabelsQuery,
  useGetLabelsByQuery,
} from '@/hooks/api/labels';
import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
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
  const [searchInput, setSearchInput] = useState('');
  const [currentPageLabels, setCurrentPageLabels] = useState(1);

  const labelsQuery = useGetLabelsByQuery({
    name: searchInput,
    paginationOptions: {
      start: (currentPageLabels - 1) * labelsPerPage,
      limit: labelsPerPage,
    },
  });
  const totalItemsLabels = labelsQuery.data?.totalItems ?? 0;
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
      <Page.Actions>
        <Link href="/manage/labels/create" css="text-transform: lowercase;">
          {t('labels.overview.create')}
        </Link>
      </Page.Actions>
      <Page.Content spacing={5}>
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

        <Stack spacing={5}>
          {labelsQuery.status === QueryStatus.LOADING ? (
            <Spinner />
          ) : (
            <Stack
              backgroundColor="white"
              padding={4}
              borderRadius={getGlobalBorderRadius}
              spacing={5}
              css={`
                box-shadow: ${getGlobalValue('boxShadow.medium')};
              `}
            >
              {labelsQuery.status === QueryStatus.SUCCESS &&
              labels.length > 0 ? (
                <Table
                  actions={[]}
                  columns={[
                    {
                      Header: t('labels.overview.table.name'),
                      accessor: 'name',
                      Cell: ({ cell }) => <Text>{cell.value}</Text>,
                    },
                    {
                      Header: t('labels.overview.table.invisible'),
                      accessor: 'invisible',
                      Cell: ({ cell }) =>
                        cell.value === 'invisible' ? (
                          <Text>{t('labels.overview.table.invisible')}</Text>
                        ) : null,
                    },
                    {
                      Header: t('labels.overview.table.private'),
                      accessor: 'private',
                      Cell: ({ cell }) =>
                        cell.value === 'private' ? (
                          <Text>{t('labels.overview.table.private')}</Text>
                        ) : null,
                    },
                    {
                      Header: t('labels.overview.table.excluded'),
                      accessor: 'excluded',
                      Cell: ({ cell }) =>
                        cell.value === true ? (
                          <Text>{t('labels.overview.table.excluded')}</Text>
                        ) : null,
                    },
                    {
                      Header: t('labels.overview.table.options'),
                      accessor: 'options',
                      Cell: ({ cell }) => (
                        <Link href={'/manage/labels/' + cell.value}>
                          {t('labels.overview.table.edit')}
                        </Link>
                      ),
                    },
                  ]}
                  data={labelsToTableData(labels)}
                />
              ) : null}
            </Stack>
          )}
          {labelsQuery.status !== QueryStatus.LOADING && labels.length === 0 ? (
            <Alert variant={AlertVariants.WARNING}>
              {t('labels.overview.no_results')}
            </Alert>
          ) : null}
          {labelsQuery.status === QueryStatus.ERROR ? (
            <Alert variant={AlertVariants.WARNING}>
              {t('labels.overview.something_wrong') +
                ' ' +
                '<em>more information to come later</em>'}
            </Alert>
          ) : null}
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
  async ({ req, query, cookies, queryClient }) => {
    const labels = await prefetchGetLabelsQuery({
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
