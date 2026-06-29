import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { Button } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
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
      : selectedData.filter((data) => !data.children?.length)
  ).length;

  if (selectedCount === 0) return null;

  return (
    <Inline spacing={1} alignItems="center">
      <Icon name={Icons.CHECK_CIRCLE} className="tw:text-success" />
      <Text>
        <Inline alignItems="center">
          <Button variant="link" onClick={onOpenModal}>
            <span>
              {t(
                labelsKey === 'location'
                  ? 'cultuurkuur_modal.overview.locations'
                  : 'cultuurkuur_modal.overview.education_levels',
                { count: selectedCount },
              )}
            </span>
          </Button>
          <span>{t('cultuurkuur_modal.overview.selected')}</span>
        </Inline>
      </Text>
      <Button variant="link" onClick={onOpenModal}>
        {t('cultuurkuur_modal.overview.change')}
      </Button>
    </Inline>
  );
};

export { CultuurkuurSelectionOverview };
