import { dehydrate } from 'react-query/hydration';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import Fallback from '@/pages/[...params].page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { LabelForm } from './labelForm';

const LabelsCreatePage = () => {
  const [isReactLabelsCreateEditFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_LABELS_CREATE_EDIT,
  );

  if (!isReactLabelsCreateEditFeatureFlagEnabled) return <Fallback />;

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
