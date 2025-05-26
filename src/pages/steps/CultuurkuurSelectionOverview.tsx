import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { IconSuccess } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Inline } from '@/ui/Inline';

type Props = {
  selectedData: HierarchicalData[];
};

const CultuurkuurSelectionOverview = ({ selectedData }: Props) => {
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.25rem',
        margin: '1rem 0',
      }}
    >
      {selectedData.map((item) => (
        <Inline padding={2} alignItems="center" key={item?.label}>
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
