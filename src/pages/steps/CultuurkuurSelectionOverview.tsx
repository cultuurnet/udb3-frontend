import { useEffect, useMemo } from 'react';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { IconSuccess } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Inline } from '@/ui/Inline';
import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';

type Props = {
  selectedData: string[];
  data: HierarchicalData[];
};

const CultuurkuurSelectionOverview = ({ selectedData, data }: Props) => {
  const manager = useMemo(
    () => new CultuurkuurLabelsManager(data, selectedData),
    [data, selectedData],
  );

  const selection = manager.getFlattenedSelection();
  console.log({ selection, cultuurkuurData: data, selectedData });
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginTop: '1rem',
      }}
    >
      {selection.map((item) => (
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
