import getConfig from 'next/config';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import PageNotFound from '@/pages/404.page';
import { Box } from '@/ui/Box';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const prefixWhenNotEmpty = (value, prefix) =>
  value ? `${prefix}${value}` : value;

const IFrame = memo(({ url, showBorder }) => (
  <Box
    id="fallback_frame"
    as="iframe"
    src={url}
    width="100%"
    flex={1}
    css={`
      ${showBorder ? 'border: 2px solid red;' : ''}
      height: 100vh;
    `}
  />
));

IFrame.displayName = 'IFrame';

IFrame.propTypes = {
  url: PropTypes.string,
  showBorder: PropTypes.bool,
};

const Fallback = () => {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const [showBorder] = useFeatureFlag(FeatureFlags.SHOW_IFRAME_BORDER);

  // Keep track of which paths were not found. Do not store as a single boolean
  // for the current path, because it's possible to navigate from a 404 path to
  // another page that's handled by this same Fallback component and then the
  // boolean notFound state would not update.
  const [notFoundPaths, setNotFoundPaths] = useState(['/404']);
  useHandleWindowMessage({
    [WindowMessageTypes.URL_UNKNOWN]: () =>
      setNotFoundPaths([router.asPath, ...notFoundPaths]),
  });

  const isClientSide = useIsClient();

  const legacyPath = useLegacyPath();

  if (notFoundPaths.includes(router.asPath)) {
    return <PageNotFound />;
  }

  // Only render the iframe on the client-side.
  // Otherwise the iframe is already in the DOM before the
  // window.addEventListener() from useHandleWindowMessage gets registered,
  // and then the 404 logic does not get triggered because the listener is too
  // late to get the message from the AngularJS app.
  if (isClientSide) {
    return <IFrame url={legacyPath} showBorder={showBorder} />;
  }

  return null;
};

export const getServerSideProps = getApplicationServerSideProps();

export default Fallback;
