import { dehydrate } from '@tanstack/react-query';

import { prefetchGetLabelByIdQuery } from '@/hooks/api/labels';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { LabelForm } from '../labelForm';

const LabelEditPage = () => {
  return <LabelForm />;
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { labelId } = query as { labelId: string };

    await prefetchGetLabelByIdQuery({ req, queryClient, id: labelId });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelEditPage;
