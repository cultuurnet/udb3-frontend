import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TabContent } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';
import { colors } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Scope } from '../create/OfferForm';

const Search = () => {
  const { publicRuntimeConfig } = getConfig();
  const { t } = useTranslation();
  const [iframeHeight, setIframeHeight] = useState(0);
  const legacyPath = useLegacyPath();
  const { query, ...router } = useRouter();
  const tab = (query?.tab as Scope) ?? 'event-places';
  const { udbMainDarkBlue } = colors;

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

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== publicRuntimeConfig.legacyAppUrl) {
        return;
      }

      if (event.data.height) {
        setIframeHeight(event.data.height);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
            css={`
              .nav {
                margin-left: 1.5rem;
                margin-bottom: 1.5rem;
              }
              .nav-item.nav-link {
                padding: 0.4rem 1rem;
                border: 1px solid black;
              }
              .nav-item {
                margin: 0 !important;
                border-radius: 0;

                &:first-child {
                  border-right: none;
                  border-radius: 0.5rem 0 0 0.5rem;
                }

                &:last-child {
                  border-radius: 0 0.5rem 0.5rem 0;
                }

                &.active {
                  color: white;
                }

                &.active:hover {
                  background-color: ${udbMainDarkBlue};
                }
              }
            `}
          >
            <Tabs.Tab eventKey="event-places" title={t('search.event_places')}>
              {tab === 'event-places' && (
                <TabContent>
                  <Stack flex={1}>
                    <iframe
                      height={iframeHeight ? `${iframeHeight}px` : '100%'}
                      css={`
                        overflow: hidden;
                      `}
                      src={legacyPath}
                    ></iframe>
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
