import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
import { OfferTypes, ScopeTypes } from '@/constants/OfferType';
import { useGetCalendarSummaryQuery } from '@/hooks/api/events';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import i18n, { SupportedLanguage } from '@/i18n/index';
import { LabelsForm } from '@/pages/LabelsForm';
import { BookingAvailability, isEvent } from '@/types/Event';
import { hasOnlineLocation } from '@/types/Offer';
import { isPlace } from '@/types/Place';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { List as UiList } from '@/ui/List';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Tabs } from '@/ui/Tabs';
import { Text, TextVariants } from '@/ui/Text';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

import { BookingInfoPreview } from './BookingInfoPreview';
import { ContactInfoPreview } from './ContactInfoPreview';
import { LocationPreview } from './LocationPreview';

const getGlobalValue = getValueFromTheme('global');

const { udbMainDarkGrey, udbMainLightGrey } = colors;

const Preview = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { eventId } = router.query;
  const getLinkThemeValue = getValueFromTheme('link');
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || 'details';
    }
    return 'details';
  });

  const getOfferByIdQuery = useGetOfferByIdQuery({
    id: eventId as string,
    scope: OfferTypes.EVENTS,
  });

  const getCalendarSummaryQuery = useGetCalendarSummaryQuery({
    id: eventId as string,
    locale: i18n.language,
    format: 'lg',
  });

  const offer = getOfferByIdQuery.data;

  const calendarSummary = getCalendarSummaryQuery.data;

  const { mainLanguage, name, terms } = offer;

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

  const tabOptions = ['details']; //['details', 'history', 'publication'];

  const onTabChange = (key: string) => {
    setActiveTab(key);
    window.location.hash = key;
  };

  const columns = [
    { Header: 'Field', accessor: 'field' },
    { Header: 'Value', accessor: 'value' },
  ];

  const EmptyValue = ({ children }) => {
    return <Text className="empty-value">{children}</Text>;
  };

  const OrganizerPreview = () => {
    const organizer = offer.organizer;
    if (!organizer)
      return <EmptyValue>{t('preview.empty_value.organiser')}</EmptyValue>;

    const organizerName = getLanguageObjectOrFallback<string>(
      organizer.name,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );

    const organizerId = parseOfferId(organizer['@id']);

    return (
      <Link href={`/organizers/${organizerId}/preview`}>{organizerName}</Link>
    );
  };

  const PriceInfo = () => {
    if (!offer.priceInfo || offer.priceInfo.length === 0) {
      return <EmptyValue>{t('preview.empty_value.price')}</EmptyValue>;
    }

    return (
      <table
        css={`
          background-color: #f0f0f0;
          width: 100%;

          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
        `}
      >
        <tbody>
          {offer.priceInfo.map((price, index) => (
            <tr key={index}>
              <td>
                {getLanguageObjectOrFallback<string>(
                  price.name,
                  i18n.language as SupportedLanguage,
                  mainLanguage,
                )}
              </td>
              <td>{price.price.toString().replace('.', ',')} euro</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const BookingPreview = () => {
    // TODO shouldn't we check this at a higher level.
    // Do we reuse this table between Events and Places?
    if (isPlace(offer)) return null;

    return (
      <Text>
        {offer.bookingAvailability.type === BookingAvailability.AVAILABLE
          ? t('bookingAvailability.available')
          : t('bookingAvailability.unavailable')}
      </Text>
    );
  };

  const PublicationPreview = () => {
    const workflowStatus = offer.workflowStatus;

    // TODO check the 'Online vanaf status' in detail
    // Need to fill in the date?
    // @see src/pages/dashboard/index.page.tsx: rowStatus
    return <Text>{t(`workflowStatus.${workflowStatus}`)}</Text>;
  };

  const AgePreview = () => {
    const hasAgeInfo = !!offer.typicalAgeRange;

    if (!hasAgeInfo) return null;

    if (offer.typicalAgeRange === '-' || offer.typicalAgeRange === '0-') {
      return <Text>{t('create.name_and_age.age.all')}</Text>;
    }

    const ageRangeLabelKey = Object.keys(AgeRanges).find((key) => {
      const ageRange = AgeRanges[key];
      return ageRange.apiLabel === offer.typicalAgeRange;
    });

    return <Text>{AgeRanges[ageRangeLabelKey]?.label}</Text>;
  };

  const ImagePreview = () => {
    const HEIGHT = 100;
    const hasImages = (offer.mediaObject ?? []).length > 0;

    if (!hasImages)
      return <EmptyValue>{t('preview.empty_value.images')}</EmptyValue>;

    return offer.mediaObject?.map((media, index) => {
      const isLastImage = index === offer.mediaObject!.length - 1;
      return (
        <Inline
          spacing={4}
          key={media['@id']}
          alignItems="center"
          paddingBottom={3}
          marginBottom={4}
          css={`
            border-bottom: ${isLastImage
              ? 'none'
              : `1px solid ${udbMainLightGrey}`};
          `}
        >
          <Link href={media.contentUrl} target="_blank">
            <Image
              src={`${media.thumbnailUrl}?height=${HEIGHT}`}
              alt={media.description}
              width="auto"
            />
          </Link>
          <Stack spacing={1}>
            {index === 0 && (
              <Text
                backgroundColor={udbMainDarkGrey}
                color="white"
                alignSelf="flex-start"
                borderRadius="3px"
                paddingRight={3}
                paddingLeft={3}
                fontSize="0.8rem"
                fontWeight="bold"
              >
                Hoofdafbeelding
              </Text>
            )}
            <Text>{media.description}</Text>
            <Text variant={TextVariants.MUTED}>© {media.copyrightHolder}</Text>
          </Stack>
        </Inline>
      );
    });
  };

  const VideoPreview = () => {
    // TODO check with Sarah if we need real previews here?
    const hasVideos = (offer.videos ?? []).length > 0;

    if (!hasVideos)
      return <EmptyValue>{t('preview.empty_value.videos')}</EmptyValue>;

    return (
      <UiList
        css={`
          display: block;
        `}
      >
        {offer.videos?.map((video) => (
          <UiList.Item
            key={video['@id']}
            css={`
              display: list-item;
              list-style-type: disc;
              margin-left: 20px;
            `}
          >
            <Link href={video.url} target="_blank">
              {video.url}
            </Link>
          </UiList.Item>
        ))}
      </UiList>
    );
  };

  const tableData = [
    { field: t('preview.labels.title'), value: title },
    { field: t('preview.labels.type'), value: typeTerm.label },
    {
      field: t('preview.labels.labels'),
      value: (
        <LabelsForm
          scope={ScopeTypes.EVENTS}
          id={eventId as string}
          entity={offer}
        />
      ),
    },
    {
      field: t('preview.labels.description'),
      // TODO sanitize html with dompurify which tags are allowed?
      value: description ? (
        <Text
          css={`
            p {
              margin: 7.5px 0;
            }
            a {
              color: ${getLinkThemeValue('color')};
              text-decoration: underline;
              &:hover {
                color: ${getLinkThemeValue('hoverColor')};
              }
            }
            ul {
              list-style-type: disc;
              margin: 7.5px 0 7.5px 20px;
            }
            ol {
              list-style-type: decimal;
              margin: 7.5px 0 7.5px 20px;
            }
          `}
          dangerouslySetInnerHTML={{ __html: description }}
        />
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
      field: t('preview.labels.calendar'),
      value: (
        <Text
          css={`
            white-space: pre-wrap;
          `}
        >
          {calendarSummary}
        </Text>
      ),
    },
    { field: t('preview.labels.organizer'), value: <OrganizerPreview /> },
    { field: t('preview.labels.price'), value: <PriceInfo /> },
    { field: t('preview.labels.booking'), value: <BookingPreview /> },
    { field: t('preview.labels.publication'), value: <PublicationPreview /> },
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
    { field: t('preview.labels.age'), value: <AgePreview /> },
    { field: t('preview.labels.image'), value: <ImagePreview /> },
    { field: t('preview.labels.video'), value: <VideoPreview /> },
  ];

  const DetailsTabContent = () => {
    return (
      <Table
        bordered
        showHeader={false}
        columns={columns}
        data={tableData}
        css={`
          td strong,
          td b {
            font-weight: 700 !important;
          }

          td em,
          td i {
            font-style: italic !important;
          }
          tr:has(td:nth-child(2) .empty-value) td {
            background-color: ${colors.grey4};
          }
          tr:has(td:nth-child(2) .empty-value) td:nth-child(2) {
            color: ${colors.grey5};
          }
        `}
      />
    );
  };

  const HistoryTabContent = () => {
    return <Text>{t('preview.tabs.history_content')}</Text>;
  };

  const PublicationTabContent = () => {
    return <Text>{t('preview.tabs.publication_content')}</Text>;
  };

  return (
    <Page>
      <Page.Title>{title}</Page.Title>
      <Page.Content>
        <Inline>
          <Stack flex={3}>
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => onTabChange(key as string)}
            >
              {tabOptions.map((tab) => (
                <Tabs.Tab eventKey={tab} title={t(`preview.tabs.${tab}`)}>
                  <Stack
                    marginTop={4}
                    backgroundColor="white"
                    padding={4}
                    borderRadius={getGlobalBorderRadius}
                    css={`
                      box-shadow: ${getGlobalValue('boxShadow.medium')};
                    `}
                  >
                    {tab === 'details' && <DetailsTabContent />}
                    {tab === 'history' && <HistoryTabContent />}
                    {tab === 'publication' && <PublicationTabContent />}
                  </Stack>
                </Tabs.Tab>
              ))}
            </Tabs>
          </Stack>
          <Stack spacing={3.5} flex={1}>
            {/* <OfferPreviewSidebar offer={offer} /> */}
          </Stack>
        </Inline>
      </Page.Content>
    </Page>
  );
};

export { Preview };
