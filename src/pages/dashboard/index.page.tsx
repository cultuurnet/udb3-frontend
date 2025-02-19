import { format, isAfter, isFuture } from 'date-fns';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { ComponentType, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient, UseQueryResult } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import { CalendarType } from '@/constants/CalendarType';
import { Scope, ScopeTypes } from '@/constants/OfferType';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  useDeleteEventByIdMutation,
  useGetEventsByCreatorQuery,
} from '@/hooks/api/events';
import {
  useDeleteOrganizerByIdMutation,
  useGetOrganizersByCreatorQuery,
  useGetOrganizersByQueryQuery,
  useGetSuggestedOrganizersQuery,
} from '@/hooks/api/organizers';
import {
  useDeletePlaceByIdMutation,
  useGetPlacesByCreatorQuery,
} from '@/hooks/api/places';
import {
  useGetPermissionsQuery,
  useGetUserQuery,
  useGetUserQueryServerSide,
  User,
} from '@/hooks/api/user';
import { SupportedLanguage } from '@/i18n/index';
import { PermissionTypes } from '@/layouts/Sidebar';
import { Footer } from '@/pages/Footer';
import { RequestOwnershipModal } from '@/pages/organizers/[organizerId]/preview/RequestOwnershipModal';
import type { Event } from '@/types/Event';
import { Offer } from '@/types/Offer';
import type { Organizer } from '@/types/Organizer';
import type { Place } from '@/types/Place';
import { Values } from '@/types/Values';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Dropdown } from '@/ui/Dropdown';
import { Icons } from '@/ui/Icon';
import type { InlineProps } from '@/ui/Inline';
import { getInlineProps, Inline } from '@/ui/Inline';
import { LabelPositions } from '@/ui/Label';
import { Link, LinkVariants } from '@/ui/Link';
import { List } from '@/ui/List';
import { Modal, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Panel } from '@/ui/Panel';
import { SelectWithLabel } from '@/ui/SelectWithLabel';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';
import { Text, TextVariants } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';
import { parseOfferType } from '@/utils/parseOfferType';

import { DashboardPictureUploadModal } from './DashboardPictureUploadModal';
import { DashboardRow } from './DashboardRow';
import { NewsletterSignupForm } from './NewsletterSingupForm';

const { publicRuntimeConfig } = getConfig();

type Item = Event | Place | Organizer;

const globalAlertMessages =
  typeof publicRuntimeConfig.globalAlertMessage === 'string'
    ? JSON.parse(publicRuntimeConfig.globalAlertMessage)
    : undefined;

const globalAlertVariant = Object.values(AlertVariants).some(
  (variant) => variant === publicRuntimeConfig.globalAlertVariant,
)
  ? publicRuntimeConfig.globalAlertVariant
  : AlertVariants.PRIMARY;

const getValue = getValueFromTheme('dashboardPage');

const itemsPerPage = 14;

const getGlobalValue = getValueFromTheme('global');

const UseGetItemsByCreatorMap = {
  events: useGetEventsByCreatorQuery,
  places: useGetPlacesByCreatorQuery,
  organizers: useGetOrganizersByCreatorQuery,
} as const;

const UseDeleteItemByIdMap = {
  events: useDeleteEventByIdMutation,
  places: useDeletePlaceByIdMutation,
  organizers: useDeleteOrganizerByIdMutation,
} as const;

const CreateMap = {
  events: '/create?scope=events',
  places: '/create?scope=places',
  organizers: '/organizers/create',
};

const RowStatus = {
  APPROVED: 'APPROVED',
  DRAFT: 'DRAFT',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  PLANNED: 'PLANNED',
} as const;

type RowStatus = Values<typeof RowStatus>;

const RowStatusToColor: Record<RowStatus, string> = {
  DRAFT: colors.warning,
  REJECTED: colors.danger,
  APPROVED: colors.udbMainPositiveGreen,
  PUBLISHED: colors.udbMainPositiveGreen,
  PLANNED: 'blue',
};

export type Status = {
  color?: string;
  label?: string;
  isExternalCreator?: boolean;
};

type StatusIndicatorProps = InlineProps & Status;

export const StatusIndicator = ({
  color,
  label,
  isExternalCreator,
  ...props
}: StatusIndicatorProps) => {
  const { t } = useTranslation();
  return (
    <Stack>
      <Inline
        marginBottom={1}
        spacing={3}
        alignItems="center"
        {...getInlineProps(props)}
      >
        {color &&
          label && [
            <Box
              key="status-indicator-box"
              width="0.90rem"
              height="0.90rem"
              backgroundColor={color}
              borderRadius="50%"
              flexShrink={0}
            />,
            <Text key="status-indicator-label" variant={TextVariants.MUTED}>
              {label}
            </Text>,
          ]}
      </Inline>
      {isExternalCreator && (
        <Text variant={TextVariants.MUTED}>
          {t('dashboard.external_creator')}
        </Text>
      )}
    </Stack>
  );
};

type ExistingOffer = Omit<Offer, 'workflowStatus'> & {
  workflowStatus: Exclude<WorkflowStatus, 'DELETED'>;
};

type OfferRowProps = InlineProps & {
  item: ExistingOffer;
  onDelete: (item: ExistingOffer) => void;
};

const OfferRow = ({ item: offer, onDelete, ...props }: OfferRowProps) => {
  const { t, i18n } = useTranslation();

  const getUserQuery = useGetUserQuery();
  const userId = getUserQuery.data?.sub;
  const userIdv1 = getUserQuery.data?.['https://publiq.be/uitidv1id'];
  const isExternalCreator = ![userId, userIdv1].includes(offer.creator);

  const offerType = parseOfferType(offer['@context']);

  const isFinished = isAfter(new Date(), new Date(offer.availableTo));
  const isPublished = ['APPROVED', 'READY_FOR_VALIDATION'].includes(
    offer.workflowStatus,
  );
  const isPlanned = isPublished && isFuture(new Date(offer.availableFrom));

  const date = offer.calendarSummary[i18n.language].text['xs'];
  const editUrl = `/${offerType}/${parseOfferId(offer['@id'])}/edit`;
  const previewUrl = `/${offerType}/${parseOfferId(offer['@id'])}/preview`;
  const duplicateUrl = `/${offerType}/${parseOfferId(offer['@id'])}/duplicate`;

  const typeId = offer.terms.find((term) => term.domain === 'eventtype')?.id;
  const imageUrl = offer.image;
  const eventScore = offer.completeness;
  const eventId = parseOfferId(offer['@id']);
  const scope = parseOfferType(offer['@context']);

  // The custom keySeparator was necessary because the ids contain '.' which i18n uses as default keySeparator
  const eventType = typeId
    ? t(`eventTypes*${typeId}`, { keySeparator: '*' })
    : undefined;

  const period =
    offer.calendarSummary[i18n.language]?.text?.[
      offer.calendarType === CalendarType.SINGLE ? 'lg' : 'sm'
    ];

  const rowStatus = useMemo<RowStatus>(() => {
    if (isPlanned) {
      return 'PLANNED';
    }

    if (isPublished) {
      return 'PUBLISHED';
    }

    if (offer.workflowStatus === WorkflowStatus.READY_FOR_VALIDATION) {
      return WorkflowStatus.DRAFT;
    }

    return offer.workflowStatus;
  }, [offer.workflowStatus, isPlanned, isPublished]);

  const statusColor = useMemo(() => {
    return RowStatusToColor[rowStatus];
  }, [rowStatus]);

  const statusLabel = useMemo(() => {
    if (rowStatus === 'REJECTED') {
      return t('dashboard.row_status.rejected');
    }

    if (rowStatus === 'PUBLISHED') {
      return t('dashboard.row_status.published');
    }

    if (rowStatus === 'PLANNED') {
      return t('dashboard.row_status.published_from', {
        date: format(new Date(offer.availableFrom), 'dd/MM/yyyy'),
      });
    }

    return t('dashboard.row_status.draft');
  }, [offer.availableFrom, rowStatus, t]);

  const [isPictureUploadModalVisible, setIsPictureUploadModalVisible] =
    useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  return (
    <DashboardRow
      title={offer.name[i18n.language] ?? offer.name[offer.mainLanguage]}
      type={eventType}
      date={date}
      imageUrl={imageUrl}
      score={eventScore}
      eventId={eventId}
      scope={scope}
      url={previewUrl}
      isFinished={isFinished}
      isImageUploading={isImageUploading}
      onModalOpen={() => setIsPictureUploadModalVisible(true)}
      actions={[
        <Link href={editUrl} variant={LinkVariants.BUTTON_SECONDARY} key="edit">
          {t('dashboard.actions.edit')}
        </Link>,
        <Dropdown.Item href={previewUrl} key="preview">
          {t('dashboard.actions.preview')}
        </Dropdown.Item>,
        offerType === 'event' && <Dropdown.Divider key="divider" />,
        offerType === 'event' && (
          <Dropdown.Item href={duplicateUrl} key="duplicate">
            {t('dashboard.actions.duplicate')}
          </Dropdown.Item>
        ),
        <Dropdown.Divider key="divider" />,
        <Dropdown.Item onClick={() => onDelete(offer)} key="delete">
          {t('dashboard.actions.delete')}
        </Dropdown.Item>,
      ]}
      finishedAt={
        isFinished &&
        t('dashboard.passed', { type: t(`dashboard.${offerType}`) })
      }
      status={{
        color: statusColor,
        label: statusLabel,
        isExternalCreator,
      }}
      {...getInlineProps(props)}
    >
      <DashboardPictureUploadModal
        eventId={eventId}
        scope={scope}
        isImageUploading={isImageUploading}
        isPictureUploadModalVisible={isPictureUploadModalVisible}
        onModalClose={() => setIsPictureUploadModalVisible(false)}
        onImageUploadStart={() => setIsImageUploading(true)}
        onImageUploadEnd={() => setIsImageUploading(false)}
      />
    </DashboardRow>
  );
};

type OrganizerRowProps = InlineProps & {
  item: Organizer;
  onDelete: (item: Organizer) => void;
  actions?: React.ReactNode[];
};

const OrganizerRow = ({
  item: organizer,
  onDelete,
  actions,
  ...props
}: OrganizerRowProps) => {
  const { t, i18n } = useTranslation();

  const getUserQuery = useGetUserQuery();
  const getPermissionsQuery = useGetPermissionsQuery();
  const userId = getUserQuery.data?.sub;
  const userIdv1 = getUserQuery.data?.['https://publiq.be/uitidv1id'];
  const isExternalCreator = ![userId, userIdv1].includes(organizer.creator);

  const editUrl = `/organizer/${parseOfferId(organizer['@id'])}/edit`;
  const previewUrl = `/organizer/${parseOfferId(organizer['@id'])}/preview`;
  const imageUrl = organizer?.images?.[0]?.contentUrl;
  const score = organizer?.completeness;
  const organizerId = parseOfferId(organizer['@id']);
  const permissions = getPermissionsQuery?.data ?? [];
  const [isPictureUploadModalVisible, setIsPictureUploadModalVisible] =
    useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  return (
    <DashboardRow
      title={getLanguageObjectOrFallback(
        organizer.name,
        i18n.language as SupportedLanguage,
        organizer.mainLanguage as SupportedLanguage,
      )}
      url={previewUrl}
      imageUrl={imageUrl}
      score={score}
      scope={ScopeTypes.ORGANIZERS}
      isImageUploading={isImageUploading}
      onModalOpen={() => setIsPictureUploadModalVisible(true)}
      actions={
        actions || [
          <Link
            href={editUrl}
            variant={LinkVariants.BUTTON_SECONDARY}
            key="edit"
          >
            {t('dashboard.actions.edit')}
          </Link>,
          <Dropdown.Item href={previewUrl} key="preview">
            {t('dashboard.actions.preview')}
          </Dropdown.Item>,
          permissions?.includes(PermissionTypes.ORGANISATIES_BEHEREN) && (
            <Dropdown.Item onClick={() => onDelete(organizer)} key="delete">
              {t('dashboard.actions.delete')}
            </Dropdown.Item>
          ),
        ]
      }
      status={{
        isExternalCreator,
      }}
      {...getInlineProps(props)}
    >
      <DashboardPictureUploadModal
        eventId={organizerId}
        scope={ScopeTypes.ORGANIZERS}
        isImageUploading={isImageUploading}
        isPictureUploadModalVisible={isPictureUploadModalVisible}
        onModalClose={() => setIsPictureUploadModalVisible(false)}
        onImageUploadStart={() => setIsImageUploading(true)}
        onImageUploadEnd={() => setIsImageUploading(false)}
      />
    </DashboardRow>
  );
};

type TabContentProps = {
  tab: string;
  status: string;
  items: Item[];
  totalItems: number;
  page: number;
  Row: ComponentType<any>;
  actions?: React.ReactNode[];
  onChangePage: (page: number) => void;
  onDelete: (item: Item) => void;
};

const TabContent = ({
  tab,
  items,
  status,
  Row,
  page,
  totalItems,
  onDelete,
  onChangePage,
}: TabContentProps) => {
  const { t } = useTranslation();

  const hasMoreThanOnePage = Math.ceil(totalItems / itemsPerPage) > 1;

  if (status === QueryStatus.LOADING) {
    return (
      <Panel
        backgroundColor="white"
        css={`
          border: none !important;
          box-shadow: unset !important;
        `}
      >
        <Spinner marginY={4} />
      </Panel>
    );
  }

  if (!items?.length) {
    return (
      <Panel
        css={`
          border: none !important;
          box-shadow: unset !important;
        `}
        backgroundColor="white"
        minHeight="5rem"
        alignItems="center"
        justifyContent="center"
      >
        <Text margin={3} maxWidth="36rem">
          {t(`dashboard.no_items.${tab}`)}
        </Text>
      </Panel>
    );
  }

  return (
    <Panel
      css={`
        border: none !important;
        box-shadow: unset !important;
      `}
    >
      <List>
        {items.map((item) => (
          <List.Item
            key={item['@id']}
            backgroundColor={getValue('listItem.backgroundColor')}
            css={`
              margin-top: 1rem;
              margin-bottom: 1rem;
              border-radius: 0.5rem;
              box-shadow: ${getGlobalValue('boxShadow.medium')};
            `}
          >
            <Row item={item} onDelete={onDelete} />
          </List.Item>
        ))}
      </List>
      {hasMoreThanOnePage && (
        <Panel.Footer
          css={`
            border: none !important;
            background-color: white !important;
          `}
        >
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            perPage={itemsPerPage}
            onChangePage={onChangePage}
          />
        </Panel.Footer>
      )}
    </Panel>
  );
};

const SortingField = {
  AVAILABLETO: 'availableTo',
  CREATED: 'created',
  COMPLETENESS: 'completeness',
} as const;

const SortingOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

const Dashboard = (): any => {
  const { t, i18n } = useTranslation();
  const { pathname, query, asPath, ...router } = useRouter();

  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toBeDeletedItem, setToBeDeletedItem] = useState<Item>();

  const tab = (query?.tab as Scope) ?? 'events';
  const page = parseInt((query?.page as string) ?? '1');
  const sort = (query?.sort as string) ?? 'created_desc';

  const useGetItemsByCreator = useMemo(
    () =>
      UseGetItemsByCreatorMap[
        (tab as keyof typeof UseGetItemsByCreatorMap) ?? 'events'
      ],
    [tab],
  );

  const sortingField = useMemo(() => {
    return sort?.split('_')?.[0] ?? SortingField.CREATED;
  }, [sort]);

  const sortingOrder = useMemo(() => {
    return sort?.split('_')?.[1] ?? SortingOrder.DESC;
  }, [sort]);

  const useDeleteItemById = useMemo(
    () => UseDeleteItemByIdMap[tab ?? 'events'],
    [tab],
  );

  const handleSelectTab = async (tabKey: Scope) =>
    router.push(
      {
        pathname: '/dashboard',
        query: {
          tab: tabKey,
          page: 1,
          ...(!(tabKey === 'organizers' && sort?.startsWith('availableTo')) && {
            sort,
          }),
        },
      },
      undefined,
      { shallow: true },
    );

  const getUserQuery = useGetUserQuery();
  const user = getUserQuery.data as User;

  const handleSelectSorting = (event) => {
    const sortValue = event.target.value;
    router.push(
      { pathname: `/dashboard`, query: { tab, page: 1, sort: sortValue } },
      undefined,
      { shallow: true },
    );
  };

  const suggestedOrganizerIds = useGetSuggestedOrganizersQuery(
    {},
    { enabled: tab === 'organizers' },
  );

  suggestedOrganizerIds.data;

  const suggestedOrganizers = useGetOrganizersByQueryQuery(
    {
      q: suggestedOrganizerIds.data?.member
        .map((result) => `id:${parseOfferId(result['@id'])}`)
        .join(' OR '),
    },
    {
      enabled: suggestedOrganizerIds.data?.member?.length > 0,
    },
  );

  const getItemsByCreatorQuery = useGetItemsByCreator({
    creator: user,
    sortOptions: { field: sortingField, order: sortingOrder },
    paginationOptions: {
      start: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
  });

  const deleteItemByIdMutation = useDeleteItemById({
    onSuccess: () => {
      setIsModalVisible(false);
      return queryClient.invalidateQueries(tab);
    },
  });

  const items = getItemsByCreatorQuery.data?.member ?? [];

  const sharedTableContentProps = {
    tab,
    status: getItemsByCreatorQuery.status,
    items,
    totalItems: getItemsByCreatorQuery.data?.totalItems ?? 0,
    page,
    onChangePage: async (page: number) => {
      await router.push({ pathname, query: { ...query, page } }, undefined, {
        shallow: true,
      });
    },
    onDelete: (item: Item) => {
      setToBeDeletedItem(item);
      setIsModalVisible(true);
    },
  };

  const SORTING_OPTIONS = [
    'created_desc',
    'created_asc',
    'availableTo_desc',
    'availableTo_asc',
    'completeness_asc',
    'completeness_desc',
  ];

  const filteredSortingOptions =
    tab === 'organizers'
      ? SORTING_OPTIONS.filter((option) => !option.includes('availableTo'))
      : SORTING_OPTIONS;

  const createOfferUrl = CreateMap[tab];
  const { udbMainDarkBlue, textColor } = colors;

  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [currentOrganizer, setCurrentOrganizer] = useState<Organizer | null>(
    null,
  );

  const SuggestedOrganizerRow = useMemo(
    () =>
      function SuggestedOrganizerRow(props: OrganizerRowProps) {
        return (
          <OrganizerRow
            {...props}
            actions={[
              <Button
                key="request"
                variant={ButtonVariants.PRIMARY}
                onClick={() => {
                  setCurrentOrganizer(props.item);
                  setIsRequestModalVisible(true);
                }}
              >
                {t('organizers.detail.actions.request')}
              </Button>,
            ]}
          />
        );
      },
    [t],
  );

  return (
    <Page backgroundColor="white" key="page">
      <Page.Title>
        {user?.['https://publiq.be/first_name']
          ? `${t('dashboard.welcome')}, ${user['https://publiq.be/first_name']}`
          : `${t('dashboard.welcome')},`}
      </Page.Title>
      <Page.Content spacing={5}>
        {globalAlertMessages && (
          <Inline>
            <Alert variant={globalAlertVariant}>
              {globalAlertMessages[i18n.language ?? 'nl']}
            </Alert>
          </Inline>
        )}
        <Inline>
          <Link href={createOfferUrl} variant={LinkVariants.BUTTON_PRIMARY}>
            {t(`dashboard.create.${tab}`)}
          </Link>
        </Inline>

        <Stack position="relative">
          <Inline
            position="absolute"
            height="2.8rem"
            top={0}
            right={0}
            alignItems="center"
            spacing={4}
          >
            <Text as="div" display={{ default: 'block', l: 'none' }}>
              <Trans
                i18nKey={`dashboard.sorting.results.${tab}`}
                count={sharedTableContentProps.totalItems}
              >
                <Text fontWeight="bold" />
              </Trans>
            </Text>
            <SelectWithLabel
              key="select"
              id="sorting"
              label={`${t('dashboard.sorting.label')}:`}
              value={sort}
              onChange={handleSelectSorting}
              width="auto"
              labelPosition={LabelPositions.LEFT}
            >
              {filteredSortingOptions.map((sortOption) => (
                <option key={sortOption} value={sortOption}>
                  {t(`dashboard.sorting.${sortOption}`)}
                </option>
              ))}
            </SelectWithLabel>
          </Inline>
          <Tabs<Scope>
            activeKey={tab}
            onSelect={handleSelectTab}
            activeBackgroundColor="white"
            css={`
              .nav-item.nav-link {
                color: ${textColor};
                padding: 0;
                margin-right: 1.5rem;
                margin-top: 0.5rem;
              }
              .nav-item {
                border: none !important;

                &.active {
                  border-bottom: 3px solid ${udbMainDarkBlue} !important;
                }

                &:hover {
                  background-color: transparent;
                }
              }
            `}
          >
            <Tabs.Tab eventKey="events" title={t('dashboard.tabs.events')}>
              {tab === 'events' && (
                <TabContent {...sharedTableContentProps} Row={OfferRow} />
              )}
            </Tabs.Tab>
            <Tabs.Tab eventKey="places" title={t('dashboard.tabs.places')}>
              {tab === 'places' && (
                <TabContent {...sharedTableContentProps} Row={OfferRow} />
              )}
            </Tabs.Tab>
            <Tabs.Tab
              eventKey="organizers"
              title={t('dashboard.tabs.organizers')}
            >
              {tab === 'organizers' && (
                <>
                  <TabContent {...sharedTableContentProps} Row={OrganizerRow} />
                  {suggestedOrganizers.data?.member?.length > 0 && (
                    <>
                      <Title>{t('dashboard.suggestions.title')}</Title>
                      <Alert variant={AlertVariants.PRIMARY} marginY={4}>
                        {t('dashboard.suggestions.description')}
                      </Alert>
                      <RequestOwnershipModal
                        organizer={currentOrganizer}
                        isVisible={isRequestModalVisible}
                        onClose={() => setIsRequestModalVisible(false)}
                      />
                      <TabContent
                        {...sharedTableContentProps}
                        Row={SuggestedOrganizerRow}
                        items={suggestedOrganizers.data?.member}
                        status={suggestedOrganizers.status}
                      />
                    </>
                  )}
                </>
              )}
            </Tabs.Tab>
          </Tabs>
        </Stack>
        {i18n.language === 'nl' && <NewsletterSignupForm />}
        <Footer />
      </Page.Content>
      <Modal
        variant={ModalVariants.QUESTION}
        visible={isModalVisible}
        onConfirm={async () => {
          deleteItemByIdMutation.mutate({
            id: parseOfferId(toBeDeletedItem['@id']),
          });
        }}
        onClose={() => setIsModalVisible(false)}
        title={t('dashboard.modal.title', {
          type: t(`dashboard.modal.types.${tab}`),
        })}
        confirmTitle={t('dashboard.actions.delete')}
        cancelTitle={t('dashboard.actions.cancel')}
      >
        {toBeDeletedItem && (
          <Box padding={4}>
            {t('dashboard.modal.question', {
              name:
                toBeDeletedItem.name[i18n.language] ??
                toBeDeletedItem.name[toBeDeletedItem.mainLanguage],
            })}
          </Box>
        )}
      </Modal>
    </Page>
  );
};

const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies: rawCookies, queryClient }) => {
    // TODO: replace by prefetch call
    // const user = (await useGetUserQueryServerSide({
    //   req,
    //   queryClient,
    // })) as User;
    //
    // await Promise.all(
    //   Object.entries(UseGetItemsByCreatorMap).map(([key, hook]) => {
    //     const page =
    //       query.tab === key ? (query.page ? parseInt(query.page) : 1) : 1;
    //
    //     const sortingField = query?.sort?.split('_')[0] ?? SortingField.CREATED;
    //     const sortingOrder = query?.sort?.split('_')[1] ?? SortingOrder.DESC;
    //
    //     return hook({
    //       req,
    //       queryClient,
    //       creator: user,
    //       ...(!(
    //         key === 'organizers' && sortingField.startsWith('availableTo')
    //       ) && {
    //         sortOptions: {
    //           field: sortingField,
    //           order: sortingOrder,
    //         },
    //       }),
    //       paginationOptions: {
    //         start: (page - 1) * itemsPerPage,
    //         limit: itemsPerPage,
    //       },
    //     });
    //   }),
    // );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies: rawCookies,
      },
    };
  },
);

const DashboardWrapper = (props) => {
  return <Dashboard {...props} />;
};

export default DashboardWrapper;
export { getServerSideProps };
