import { dehydrate } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import {
  prefetchGetLabelByIdQuery,
  useGetLabelByIdQuery,
} from '@/hooks/api/labels';
import { Label } from '@/types/Offer';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { LabelForm } from '../labelForm';

const LabelEditPage = () => {
  const router = useRouter();
  const labelId = router.query.labelId as string | undefined;

  const labelQuery = useGetLabelByIdQuery(
    { id: labelId! },
    { enabled: !!labelId },
  );

  const label: Label | undefined = useMemo(
    () => labelQuery.data ?? undefined,
    [labelQuery.data],
  );

  return <LabelForm label={label} />;
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
