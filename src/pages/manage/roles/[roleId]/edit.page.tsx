import { dehydrate } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import {
  prefetchGetRoleByIdQuery,
  useGetRoleByIdQuery,
} from '@/hooks/api/roles';
import { Role } from '@/types/Role';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { RoleForm } from '../components/RoleForm';

const RoleEditPage = () => {
  const router = useRouter();
  const { roleId } = router.query;

  const roleQuery = useGetRoleByIdQuery((roleId as string) || '');

  const role: Role | undefined = useMemo(
    () => roleQuery.data ?? undefined,
    [roleQuery.data],
  );

  return <RoleForm role={role} />;
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { roleId } = query as { roleId: string };

    await prefetchGetRoleByIdQuery({ req, queryClient, id: roleId });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default RoleEditPage;
