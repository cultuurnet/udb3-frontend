import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import PageNotFound from '@/pages/404.page';
import { Box } from '@/ui/Box';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const IFrame = memo(({ url }) => (
  <Box
    id="fallback_frame"
    as="iframe"
    src={url}
    width="100%"
    height="100vh"
    flex={1}
  />
));

IFrame.displayName = 'IFrame';

IFrame.propTypes = {
  url: PropTypes.string,
};

const Fallback = () => {
  const router = useRouter();
  const { asPath } = router;

  const { publicRuntimeConfig } = getConfig();

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

  const { cookies } = useCookiesWithOptions(['token', 'udb-language']);
  const token = cookies['token'];
  const language = cookies['udb-language'];

  const legacyPath = useMemo(() => {
    const path = new URL(`http://localhost${router.asPath}`).pathname;
    const { params = [], ...queryWithoutParams } = router.query;
    const queryString = prefixWhenNotEmpty(
      new URLSearchParams({
        ...queryWithoutParams,
        jwt: token,
        lang: language,
      }),
      '?',
    );

    return `${publicRuntimeConfig.legacyAppUrl}${path}${queryString}`;
  }, [
    language,
    publicRuntimeConfig.legacyAppUrl,
    router.asPath,
    router.query,
    token,
  ]);

  if (notFoundPaths.includes(router.asPath)) {
    return <PageNotFound />;
  }

  // Only render the iframe on the client-side.
  // Otherwise the iframe is already in the DOM before the
  // window.addEventListener() from useHandleWindowMessage gets registered,
  // and then the 404 logic does not get triggered because the listener is too
  // late to get the message from the AngularJS app.
  if (isClientSide) {
    return <IFrame url={legacyPath} />;
  }

  return null;
};

export const getServerSideProps = getApplicationServerSideProps();

export default Fallback;
