
import debounce from 'lodash/debounce';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dehydrate } from 'react-query/hydration';

import { QueryStatus } from '@/hooks/api/authenticated-query';
import { prefetchGetLabelsQuery, useGetLabelsByQuery } from '@/hooks/api/labels';
import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { Link } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const labelsPerPage = 10

const LabelsOverviewPage = () => {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [currentPageLabels, setCurrentPageLabels] = useState(1)

  const labelsQuery = useGetLabelsByQuery({
    name: searchInput,
    paginationOptions: {
      start: (currentPageLabels - 1) * labelsPerPage,
      limit: labelsPerPage,
    },
  })
  const totalItemsLabels = labelsQuery.data?.totalItems ?? 0;
  const labels = useMemo(
    () => labelsQuery.data?.member ?? [],
    [labelsQuery.data?.member],
  )

  const handleInputSearch = useCallback((event) => {
    const searchTerm = event.target.value.toString().trim();
    setCurrentPageLabels(1);
    setSearchInput(searchTerm);
  }, [])

  return (
    <Page>
      <Page.Title>{t('labels.overview.title')}</Page.Title>
      <Page.Actions>
        <Link
          href="/manage/labels/create"
          css="text-transform: lowercase;"
        >
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
            <Spinner/>
          ) : (
            <Stack>
              <code>{JSON.stringify(labels)}</code>
              <code>{totalItemsLabels}</code>
            </Stack>
        )}
          {labelsQuery.status !== QueryStatus.LOADING && labels.length === 0 ? (
            <Alert variant={AlertVariants.WARNING}>
              {t('labels.overview.no_results')}
            </Alert>
          ) : null}
          {labelsQuery.status === QueryStatus.ERROR ? (
            <Alert variant={AlertVariants.WARNING}>
              console.log(labelsQuery.error);
              {t('labels.overview.something_wrong') + ' ' + '<em>more information to come later</em>'}
            </Alert>
          ) : null}
        </Stack>


        <Pagination
          currentPage={currentPageLabels}
          totalItems={totalItemsLabels}
          perPage={10}
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
    })

    return { props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      } };
  })

export default LabelsOverviewPage;