import { dehydrate } from '@tanstack/react-query';

import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { RoleForm } from './components/RoleForm';

const CreateRolePage = () => {
  return <RoleForm />;
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

export default CreateRolePage;
