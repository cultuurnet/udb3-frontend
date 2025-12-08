import { useRouter } from 'next/router';

import { OfferTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import i18n, { SupportedLanguage } from '@/i18n/index';
import { Link } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Tabs } from '@/ui/Tabs';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

const getGlobalValue = getValueFromTheme('global');

const Preview = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const getOfferByIdQuery = useGetOfferByIdQuery({
    id: eventId as string,
    scope: OfferTypes.EVENTS,
  });

  const offer = getOfferByIdQuery.data;

  console.log({ offer });

  const { mainLanguage, name, terms, isOnline, location } = offer;

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

  const isPhysicalLocation = !isOnline;

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

  const tableData = [
    { field: 'Titel', value: title },
    { field: 'Type', value: typeTerm.label },
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
  ];

  // TODO empty rows seem to have a different background color
  // e.g. when the event has no description, the row has a grey background

  return (
    <Page>
      <Page.Title>{title}</Page.Title>
      <Page.Content>
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
      </Page.Content>
    </Page>
  );
};

export { Preview };
