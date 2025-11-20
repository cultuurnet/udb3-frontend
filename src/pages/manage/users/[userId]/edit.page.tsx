import { useRouter } from 'next/router';
import { useMemo } from 'react';

import {
  prefetchGetUserByIdQuery,
  useGetUserByIdQuery,
  User,
  UserById,
} from '@/hooks/api/user';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { UserForm } from '../userForm';

const UserEditpage = () => {
  const router = useRouter();
  const userId = router.query.userId as string | undefined;

  const userQuery = useGetUserByIdQuery(
    { id: userId as string },
    { enabled: !!userId },
  );

  const user: User | UserById | undefined = useMemo(
    () => userQuery.data ?? undefined,
    [userQuery.data],
  );

  return <UserForm user={user} />;
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { userId } = query as { userId: string };

    await prefetchGetUserByIdQuery({ req, queryClient, id: userId });

    return {
      props: {
        cookies,
      },
    };
  },
);

export default UserEditpage;
