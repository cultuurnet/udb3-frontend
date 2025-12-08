import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { Preview } from './Preview';

export const getServerSideProps = getApplicationServerSideProps(
  async ({ cookies }) => {
    return {
      props: {
        cookies,
      },
    };
  },
);

export default Preview;
