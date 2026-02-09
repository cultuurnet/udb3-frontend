import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { TabContent } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Tabs, TabsVariants } from '@/ui/Tabs';
import { colors } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Scope } from '../create/OfferForm';

const Search = () => {
  const { t } = useTranslation();
  const [iframeHeight, setIframeHeight] = useState(0);
  const legacyPath = useLegacyPath();
  const { query, ...router } = useRouter();
  const tab = (query?.tab as Scope) ?? 'events-places';
  const { udbMainDarkBlue } = colors;
  const isClientSide = useIsClient();
  const { publicRuntimeConfig } = getConfig();
  const isOwnershipEnabled = publicRuntimeConfig.ownershipEnabled === 'true';
  const [showBorder] = useFeatureFlag(FeatureFlags.SHOW_IFRAME_BORDER);

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
            ${showBorder ? 'border: 2px solid red;' : ''}
          `}
        >
          {isOwnershipEnabled && (
            <Tabs<Scope>
              activeKey={tab}
              onSelect={handleSelectTab}
              activeBackgroundColor={`${udbMainDarkBlue}`}
              variant={TabsVariants.OUTLINED}
              css={`
                .nav-tabs {
                  margin-left: 1.5rem;
                }
              `}
            >
              <Tabs.Tab
                eventKey="events-places"
                title={t('search.events_places')}
              >
                {tab === 'events-places' && (
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
                {tab === 'organizers' && (
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
            </Tabs>
          )}
          {!isOwnershipEnabled && isClientSide && (
            <iframe
              height={
                iframeHeight ? `${iframeHeight}px` : `${window.innerHeight}`
              }
              src={legacyPath}
            ></iframe>
          )}
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Search;
