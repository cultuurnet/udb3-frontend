import { useQueryClient } from '@tanstack/react-query';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { OfferTypes, ScopeTypes } from '@/constants/OfferType';
import { PermissionTypes } from '@/constants/PermissionTypes';
import { useGetOfferPermissionsQuery } from '@/hooks/api/events';
import {
  useGetOfferByIdQuery,
  useGetOfferHistoryQuery,
} from '@/hooks/api/offers';
import { useDeletePlaceByIdMutation } from '@/hooks/api/places';
import { useGetPermissionsQuery } from '@/hooks/api/user';
import { usePublicationStatus } from '@/hooks/usePublicationStatus';
import i18n, { SupportedLanguage } from '@/i18n/index';
import { AlertDuplicatePlace } from '@/pages/AlertDuplicatePlace';
import { LabelsForm } from '@/pages/LabelsForm';
import { OfferPreviewSidebar } from '@/pages/OfferPreviewSidebar';
import { AgePreview } from '@/pages/preview/AgePreview';
import { BookingInfoPreview } from '@/pages/preview/BookingInfoPreview';
import { ContactInfoPreview } from '@/pages/preview/ContactInfoPreview';
import { DescriptionPreview } from '@/pages/preview/DescriptionPreview';
import { EmptyValue } from '@/pages/preview/EmptyValue';
import { ImagePreview } from '@/pages/preview/ImagePreview';
import { LocationPreview } from '@/pages/preview/LocationPreview';
import {
  columns,
  DetailsTabContent,
} from '@/pages/preview/Tabs/DetailsTabContent';
import { HistoryTabContent } from '@/pages/preview/Tabs/HistoryTabContent';
import { VideoPreview } from '@/pages/preview/VideoPreview';
import { isCultuurkuur, isEvent } from '@/types/Event';
import { hasOnlineLocation, Offer } from '@/types/Offer';
import { isPlace } from '@/types/Place';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Inline } from '@/ui/Inline';
import { Link, LinkVariants } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { StatusIndicator } from '@/ui/StatusIndicator';
import { Table } from '@/ui/Table';
import { Tabs, TabsVariants } from '@/ui/Tabs';
import { Text } from '@/ui/Text';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';
import { parseOfferType } from '@/utils/parseOfferType';

const getGlobalValue = getValueFromTheme('global');

const Preview = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { placeId } = router.query;

  const tab = (router.query?.tab as string) ?? 'details';

  const [isModalVisible, setIsModalVisible] = useState(false);

  const getOfferByIdQuery = useGetOfferByIdQuery({
    id: placeId as string,
    scope: OfferTypes.PLACES,
  });

  const offer = getOfferByIdQuery.data;

  if (!offer) return;

  const offerType = parseOfferType(offer['@context']);

  const duplicateOfId =
    isPlace(offer) && offer?.duplicateOf
      ? parseOfferId(offer.duplicateOf)
      : undefined;

  const isEdited = router.query.edited === 'true';
  const isCultuurkuurEvent = isEvent(offer) && isCultuurkuur(offer);

  const userPermissionsQuery = useGetPermissionsQuery();
  const userPermissions = userPermissionsQuery?.data ?? [];

  const placePermissionQuery = useGetOfferPermissionsQuery({
    offerId: placeId,
    offerType: offerType,
  });

  const placePermissions: string[] =
    (placePermissionQuery?.data as { permissions?: string[] } | undefined)
      ?.permissions ?? [];

  const getOfferHistoryQuery = useGetOfferHistoryQuery(
    placeId as string,
    offerType,
  );
  const offerHistory = getOfferHistoryQuery?.data ?? [];
  const { mainLanguage, name, terms, typicalAgeRange, mediaObject, videos } =
    offer;

  const title = getLanguageObjectOrFallback<string>(
    name,
    i18n.language as SupportedLanguage,
    mainLanguage,
  );

  const typeTerm = terms.find((term) => term.domain === 'eventtype');

  const description = getLanguageObjectOrFallback<string>(
    offer.description,
    i18n.language as SupportedLanguage,
    mainLanguage,
  );

  const tabOptions = ['details'];
  const isRejected = offer.workflowStatus === WorkflowStatus.REJECTED;
  const isDeleted = offer.workflowStatus === WorkflowStatus.DELETED;
  const showEventId = !isRejected && !isDeleted;

  const isGodUser = userPermissions?.includes(
    PermissionTypes.GEBRUIKERS_BEHEREN,
  );
  const canSeeHistory = userPermissions?.includes(
    PermissionTypes.AANBOD_HISTORIEK,
  );

  if (canSeeHistory || isGodUser) {
    tabOptions.push('history');
  }

  const handleSelectTab = (tab: string) => {
    router.push({ query: { ...router.query, tab } }, undefined, {
      shallow: true,
    });
  };

  const PublicationPreview = () => {
    const status = usePublicationStatus(offer);
    const { publicRuntimeConfig } = getConfig();

    const publicationBrand = isCultuurkuurEvent
      ? t('brand_cultuurkuur')
      : t('brand_uitinvlaanderen');
    const publicUrl = isCultuurkuurEvent
      ? `${publicRuntimeConfig.ckUrl}/event/${parseOfferId(offer['@id'])}`
      : `${publicRuntimeConfig.uivUrl}/agenda/l/x/${parseOfferId(offer['@id'])}`;

    const publicationRulesUrl = publicRuntimeConfig.udbPublicationRulesUrl;

    const renderStatusCell = () => {
      if (isRejected) {
        return (
          <Stack>
            <StatusIndicator label={status.label} color={status.color} />
            <Text>
              <Trans
                i18nKey="preview.rejected_explanation"
                components={{
                  publication_rules_link: (
                    <Link href={publicationRulesUrl} target="_blank" />
                  ),
                }}
              />
            </Text>
          </Stack>
        );
      }

      return <StatusIndicator label={status.label} color={status.color} />;
    };

    const data = [
      {
        field: t('preview.labels.publication'),
        value: renderStatusCell(),
      },
    ];

    if (showEventId) {
      data.push({
        field: t('preview.labels.event_id'),
        value: <Text>{parseOfferId(offer['@id'])}</Text>,
      });
    }

    return (
      <Stack
        marginTop={4}
        backgroundColor={showEventId ? colors.white : colors.pink1}
        padding={4}
        borderRadius={getGlobalBorderRadius}
        css={`
          box-shadow: ${getGlobalValue('boxShadow.medium')};
          border: ${showEventId ? `none` : `2px solid ${colors.red3}`};
        `}
      >
        <Table
          columns={columns}
          data={data}
          showHeader={false}
          css={`
            --bs-table-bg: transparent;

            tbody tr td:nth-child(1) {
              font-weight: 600;
              width: 25%;
            }
            tbody tr:first-child td {
              border-top: none;
            }
          `}
        />
        {showEventId && (
          <Link
            href={publicUrl}
            target="_blank"
            variant={LinkVariants.BUTTON_PRIMARY}
            width="fit-content"
          >
            {t('preview.public_url', { publicationBrand })}
          </Link>
        )}
      </Stack>
    );
  };

  const tableData = [
    { field: t('preview.labels.title'), value: title },
    { field: t('preview.labels.type'), value: typeTerm.label },
    ...(isCultuurkuurEvent
      ? [
          {
            field: t('preview.labels.access'),
            value: (
              <Stack>
                <Text>{t('preview.educational')}</Text>
                <Alert marginY={4}>{t('preview.educational_info')}</Alert>
              </Stack>
            ),
          },
        ]
      : []),

    {
      field: t('preview.labels.description'),
      value: description ? (
        <DescriptionPreview description={description} />
      ) : (
        <EmptyValue>{t('preview.empty_value.description')}</EmptyValue>
      ),
    },
    {
      field: t('preview.labels.location'),
      value: <LocationPreview offer={offer} />,
    },
    ...(isEvent(offer) && hasOnlineLocation(offer) && offer.onlineUrl
      ? [
          {
            field: t('preview.labels.online_location'),
            value: <Link href={offer.onlineUrl}>{offer.onlineUrl}</Link>,
          },
        ]
      : []),
    {
      field: t('preview.labels.booking_info'),
      value: (
        <BookingInfoPreview
          bookingInfo={offer.bookingInfo}
          mainLanguage={offer.mainLanguage}
        />
      ),
    },
    {
      field: t('preview.labels.contact'),
      value: <ContactInfoPreview contactPoint={offer.contactPoint} />,
    },
    {
      field: t('preview.labels.labels'),
      value: (
        <LabelsForm
          scope={ScopeTypes.PLACES}
          id={placeId as string}
          entity={offer}
        />
      ),
    },
    {
      field: t('preview.labels.age'),
      value: <AgePreview typicalAgeRange={typicalAgeRange} />,
    },
    {
      field: t('preview.labels.image'),
      value: <ImagePreview mediaObject={mediaObject} />,
    },
    {
      field: t('preview.labels.video'),
      value: <VideoPreview videos={videos} />,
    },
  ];

  const onDeleteClick = (offer: Offer) => {
    setIsModalVisible(true);
  };

  const deleteItemByIdMutation = useDeletePlaceByIdMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['places'] });
      router.push('/dashboard?tab=places');
    },
  });

  return (
    <Page>
      <Page.Title>{title}</Page.Title>
      <Page.Content>
        <Inline>
          <Stack flex={3}>
            {duplicateOfId && (
              <AlertDuplicatePlace
                variant={AlertVariants.PRIMARY}
                placeId={duplicateOfId}
                labelKey="preview.duplicate_place.alert.description"
                marginBottom={4}
              />
            )}
            {isEdited && (
              <Alert width="100%" marginBottom={4}>
                <Text
                  css={`
                    b {
                      font-weight: 600;
                    }
                  `}
                >
                  <Trans
                    i18nKey="preview.publication_alert"
                    values={{
                      timeFrame: isCultuurkuurEvent
                        ? t('preview.publication_alert_cultuurkuur_timeframe')
                        : t('preview.publication_alert_uitagendas_timeframe'),
                      siteName: isCultuurkuurEvent
                        ? t('brand_cultuurkuur')
                        : t('preview.uit_agendas'),
                    }}
                    components={{ b: <b></b> }}
                  />
                </Text>
              </Alert>
            )}
            <Tabs
              activeKey={tab}
              onSelect={(key) => handleSelectTab(key)}
              variant={TabsVariants.DEFAULT}
            >
              {tabOptions.map((tab) => (
                <Tabs.Tab eventKey={tab} title={t(`preview.tabs.${tab}`)}>
                  {tab === 'details' && (
                    <Stack marginTop={4}>
                      <PublicationPreview />
                      <DetailsTabContent
                        tableData={tableData}
                        showEventId={showEventId}
                      />
                    </Stack>
                  )}
                  {tab === 'history' && (
                    <HistoryTabContent offerHistory={offerHistory} />
                  )}
                </Tabs.Tab>
              ))}
            </Tabs>
          </Stack>
          <Stack spacing={3.5} flex={1}>
            {
              <OfferPreviewSidebar
                offer={offer}
                onDelete={onDeleteClick}
                userPermissions={userPermissions}
                offerPermissions={placePermissions}
              />
            }
          </Stack>
        </Inline>
        <Modal
          variant={ModalVariants.QUESTION}
          visible={isModalVisible}
          onConfirm={async () => {
            deleteItemByIdMutation.mutate({
              id: parseOfferId(offer['@id']),
            });
          }}
          onClose={() => setIsModalVisible(false)}
          title={t('preview.actions.delete_modal.title_location')}
          confirmTitle={t('preview.actions.delete_modal.confirm')}
          cancelTitle={t('preview.actions.delete_modal.cancel')}
          size={ModalSizes.LG}
        >
          <Box
            padding={4}
            backgroundColor="white"
            borderRadius={getGlobalBorderRadius}
          >
            {t('preview.actions.delete_modal.body', { title: title })}
          </Box>
        </Modal>
      </Page.Content>
    </Page>
  );
};

export { Preview };
