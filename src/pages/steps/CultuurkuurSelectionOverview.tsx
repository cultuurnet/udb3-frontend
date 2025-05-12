import { useEffect, useMemo } from 'react';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { IconSuccess } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Inline } from '@/ui/Inline';

type Props = {
  selectedData: HierarchicalData[];
  cultuurkuurData: HierarchicalData[];
  labels: string[];
  onPreSelectedDataReady: (data: HierarchicalData[]) => void;
};

const CultuurkuurSelectionOverview = ({
  selectedData,
  cultuurkuurData,
  labels,
  onPreSelectedDataReady,
}: Props) => {
  const flatData = useMemo(() => {
    const flatten = (nodes: HierarchicalData[]): HierarchicalData[] =>
      nodes.flatMap((node) => [
        node,
        ...(node.children ? flatten(node.children) : []),
      ]);

    return cultuurkuurData ? flatten(cultuurkuurData) : [];
  }, [cultuurkuurData]);

  const preSelectedValues = useMemo(() => {
    return flatData.filter((region) => labels.includes(region.label));
  }, [flatData, labels]);

  useEffect(() => {
    if (preSelectedValues.length) {
      onPreSelectedDataReady(preSelectedValues);
    }
  }, [preSelectedValues, onPreSelectedDataReady]);
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginTop: '1rem',
      }}
    >
      {selectedData.map((item) => (
        <Inline padding={3} alignItems="center" key={item?.label}>
          <IconSuccess
            css={{
              color: 'green',
              marginRight: '0.5rem',
              fontSize: '1rem',
            }}
          />
          <span>{item?.name?.nl}</span>
        </Inline>
      ))}
    </Box>
  );
};

export { CultuurkuurSelectionOverview };
