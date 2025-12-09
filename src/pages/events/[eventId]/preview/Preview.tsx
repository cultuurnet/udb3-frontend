import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
import { OfferTypes, ScopeTypes } from '@/constants/OfferType';
import { useGetCalendarSummaryQuery } from '@/hooks/api/events';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import i18n, { SupportedLanguage } from '@/i18n/index';
import { LabelsForm } from '@/pages/LabelsForm';
import { AddressInternal } from '@/types/Address';
import { BookingAvailability } from '@/types/Event';
import { isPlace } from '@/types/Place';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
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

const getGlobalValue = getValueFromTheme('global');

const { udbMainDarkGrey, udbMainLightGrey } = colors;

const Preview = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { eventId } = router.query;

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

  console.log({ offer });

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

  const isPhysicalLocation = true;

  console.log({ isPhysicalLocation });

  const tabOptions = ['details'];

  const activeTab = 'details';

  const onTabChange = (key: string) => {
    console.log('tab changed to:', key);
  };

  const columns = [
    { Header: 'Field', accessor: 'field' },
    { Header: 'Value', accessor: 'value' },
  ];

  const WherePreview = () => {
    if (isPlace(offer)) return null;

    const location = offer.location;

    const locationId = parseOfferId(location['@id']);

    const locationName = getLanguageObjectOrFallback<string>(
      location.name,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );

    const addressForLang = getLanguageObjectOrFallback<AddressInternal>(
      location.address,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );

    const locationParts = [
      locationName,
      ...(location.terms.length > 0
        ? [location.terms.find((term) => term.domain === 'eventtype')?.label]
        : []),
      addressForLang?.streetAddress,
      addressForLang?.addressLocality,
    ];

    if (isPhysicalLocation) {
      return (
        <Link href={`/place/${locationId}/preview`}>
          {locationParts.join(', ')}
        </Link>
      );
    }
  };

  const OrganizerPreview = () => {
    const organizer = offer.organizer;
    if (!organizer) return null;

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
      return null;
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
    if (isPlace(offer)) return null;

    return (
      <div>
        {offer.bookingAvailability.type === BookingAvailability.AVAILABLE
          ? 'Beschikbaar'
          : 'Niet beschikbaar'}
      </div>
    );
  };

  const PublicationPreview = () => {
    const workflowStatus = offer.workflowStatus;

    // TODO check the 'Online vanaf status' in detail
    // Need to fill in the date?
    return <div>{t(`workflowStatus.${workflowStatus}`)}</div>;
  };

  const AgePreview = () => {
    const hasAgeInfo = !!offer.typicalAgeRange;

    if (!hasAgeInfo) return null;

    if (offer.typicalAgeRange === '-' || offer.typicalAgeRange === '0-') {
      return <div>Alle leeftijden</div>;
    }

    const ageRangeLabelKey = Object.keys(AgeRanges).find((key) => {
      const ageRange = AgeRanges[key];
      return ageRange.apiLabel === offer.typicalAgeRange;
    });

    return <div>{AgeRanges[ageRangeLabelKey]?.label}</div>;
  };

  const ImagePreview = () => {
    const HEIGHT = 100;
    const hasImages = (offer.mediaObject ?? []).length > 0;

    if (!hasImages) return <div>Geen afbeeldingen</div>;

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

    if (!hasVideos) return <div>Geen video's</div>;

    return (
      <ul>
        {offer.videos?.map((video) => (
          <li key={video['@id']}>
            <Link href={video.url} target="_blank">
              {video.url}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const tableData = [
    { field: 'Titel', value: title },
    { field: 'Type', value: typeTerm.label },
    {
      field: 'Labels',
      value: (
        <LabelsForm
          scope={ScopeTypes.EVENTS}
          id={eventId as string}
          entity={offer}
        />
      ),
    },
    {
      field: 'Beschrijving',
      // TODO sanitize html with dompurify which tags are allowed?
      value: <div dangerouslySetInnerHTML={{ __html: description }} />,
    },
    {
      field: 'Waar',
      // Todo what for online events?
      value: <WherePreview />,
    },
    { field: 'Wanneer', value: calendarSummary },
    { field: 'Organisatie', value: <OrganizerPreview /> },
    { field: 'Prijsinfo', value: <PriceInfo /> },
    { field: 'Tickets & plaatsen', value: <BookingPreview /> },
    { field: 'Publicatie', value: <PublicationPreview /> },
    {
      field: 'Reservatie',
      value: (
        <BookingInfoPreview
          bookingInfo={offer.bookingInfo}
          mainLanguage={offer.mainLanguage}
        />
      ),
    },
    {
      field: 'Contactgegevens',
      value: <ContactInfoPreview contactPoint={offer.contactPoint} />,
    },
    { field: 'Geschikt voor', value: <AgePreview /> },
    { field: 'Afbeeldingen', value: <ImagePreview /> },
    { field: "Video's", value: <VideoPreview /> },
  ];

  // TODO empty rows seem to have a different background color
  // e.g. when the event has no description, the row has a grey background

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
                <Tabs.Tab eventKey={tab} title={'Gegevens'}>
                  <Stack
                    marginTop={4}
                    backgroundColor="white"
                    padding={4}
                    borderRadius={getGlobalBorderRadius}
                    css={`
                      box-shadow: ${getGlobalValue('boxShadow.medium')};
                    `}
                  >
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
                      `}
                    />
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
