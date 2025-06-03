import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { Button } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';
import { expandLevel1WithChildren } from '@/utils/cultuurkuurLabels';

type Props = {
  selectedData: HierarchicalData[];
  labelsKey: string;
  onOpenModal: () => void;
};

const CultuurkuurSelectionOverview = ({
  selectedData,
  labelsKey,
  onOpenModal,
}: Props) => {
  const { t } = useTranslation();
  const selectedCount = (
    labelsKey === 'location'
      ? expandLevel1WithChildren(selectedData)
      : selectedData
  ).length;

  if (selectedCount === 0) return null;

  return (
    <Inline alignItems="center" marginTop={4} spacing={2}>
      <Text>
        <span
          css={`
            font-weight: bold;
            margin-right: 4px;
          `}
        >
          {selectedCount}
        </span>
        <span
          css={`
            font-weight: bold;
            margin-right: 4px;
          `}
        >
          {t(
            labelsKey === 'location'
              ? 'cultuurkuur_modal.overview.locations'
              : 'cultuurkuur_modal.overview.education_levels',
          )}
        </span>
        <span>{t('cultuurkuur_modal.overview.selected')}</span>
      </Text>
      <Button variant="link" onClick={onOpenModal}>
        {t('cultuurkuur_modal.overview.change')}
      </Button>
    </Inline>
  );
};

export { CultuurkuurSelectionOverview };
