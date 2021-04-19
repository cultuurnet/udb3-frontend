import { Page } from '@/ui/Page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Create = () => {
  return (
    // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
    <Page>
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'create'. Did
      you mean 'Create'?
      <Page.Title>create</Page.Title>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Create;
