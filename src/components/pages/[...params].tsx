import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { Box } from '@/ui/Box';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { memo, useMemo } from 'react';

const prefixWhenNotEmpty = (value, prefix) =>
  value ? `${prefix}${value}` : value;

// @ts-expect-error ts-migrate(2339) FIXME: Property 'url' does not exist on type '{ children?... Remove this comment to see the full error message
const IFrame = memo(({ url }) => (
  <Box
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    tabIndex={0}
    as="iframe"
    src={url}
    width="100%"
    height="100vh"
    flex={1}
  />
));

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'Named... Remove this comment to see the full error message
IFrame.propTypes = {
  url: PropTypes.string,
};

const Fallback = () => {
  const {
    // eslint-disable-next-line no-unused-vars
    query: { params = [], ...queryWithoutParams },
    asPath,
  } = useRouter();
  const { publicRuntimeConfig } = getConfig();

  const { cookies } = useCookiesWithOptions(['token', 'udb-language']);

  const legacyPath = useMemo(() => {
    const path = new URL(`http://localhost${asPath}`).pathname;

    const queryString = prefixWhenNotEmpty(
      new URLSearchParams({
        ...queryWithoutParams,
        jwt: cookies.token,
        lang: cookies['udb-language'],
      }),
      '?',
    );

    return `${publicRuntimeConfig.legacyAppUrl}${path}${queryString}`;
  }, [asPath, cookies.token, cookies['udb-language']]);

  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  return <IFrame url={legacyPath} />;
};

export const getServerSideProps = getApplicationServerSideProps();

export default Fallback;
