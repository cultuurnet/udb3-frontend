// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Page' or its correspondin... Remove this comment to see the full error message
import { Page } from '@/ui/Page';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/getApplicationServerSi... Remove this comment to see the full error message
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Create = () => {
  return (
    // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
    <Page>
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'create'. Did you mean 'Create'?
      <Page.Title>create</Page.Title>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Create;
