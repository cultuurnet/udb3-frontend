import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TabContent } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Tabs, TabsCustomVariants } from '@/ui/Tabs';
import { colors } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Scope } from '../create/OfferForm';

const Search = () => {
  const { t } = useTranslation();
  const [iframeHeight, setIframeHeight] = useState(0);
  const legacyPath = useLegacyPath();
  const { query, ...router } = useRouter();
  const tab = (query?.tab as Scope) ?? 'event-places';
  const { udbMainDarkBlue } = colors;
  const isClientSide = useIsClient();

  const handleSelectTab = async (tabKey: Scope) =>
    router.push(
      {
        pathname: '/search',
        query: {
          tab: tabKey,
        },
      },
      undefined,
      { shallow: true },
    );

  useHandleWindowMessage({
    [WindowMessageTypes.PAGE_HEIGHT]: (event) => setIframeHeight(event?.height),
  });

  return (
    <Page>
      <Page.Title>{t('search.title')}</Page.Title>
      <Page.Content>
        <Stack
          height="100%"
          width="100%"
          css={`
            overflow-y: auto;
          `}
        >
          <Tabs<Scope>
            activeKey={tab}
            onSelect={handleSelectTab}
            activeBackgroundColor={`${udbMainDarkBlue}`}
            customVariant={TabsCustomVariants.OUTLINED}
          >
            <Tabs.Tab eventKey="event-places" title={t('search.event_places')}>
              {tab === 'event-places' && (
                <TabContent>
                  <Stack flex={1}>
                    {isClientSide && (
                      <iframe
                        height={
                          iframeHeight
                            ? `${iframeHeight}px`
                            : `${window.innerHeight}`
                        }
                        src={legacyPath}
                      ></iframe>
                    )}
                  </Stack>
                </TabContent>
              )}
            </Tabs.Tab>
            <Tabs.Tab eventKey="organizers" title={t('search.organizers')}>
              {tab === 'organizers' && <div>Hello</div>}
            </Tabs.Tab>
          </Tabs>
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Search;
