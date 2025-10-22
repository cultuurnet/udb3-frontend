import { dehydrate } from '@tanstack/react-query';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import Fallback from '@/pages/[...params].page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { RoleForm } from './components/RoleForm';

const CreateRolePage = () => {
  const [isReactRolesCreateEditFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_ROLES_CREATE_EDIT,
  );

  if (!isReactRolesCreateEditFeatureFlagEnabled) return <Fallback />;

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
