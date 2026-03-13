import { dehydrate } from '@tanstack/react-query';

import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { LabelForm } from './labelForm';

const LabelsCreatePage = () => {
  return <LabelForm />;
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ queryClient, cookies }) => {
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default LabelsCreatePage;
