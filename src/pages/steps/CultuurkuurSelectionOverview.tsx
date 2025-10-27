import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { Button } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

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
  const getGlobalValue = getValueFromTheme('global');

  const selectedCount = useMemo(() => {
    return selectedData.filter((data) => !Object.hasOwn(data, 'children'))
      .length;
  }, [selectedData]);

  if (selectedCount === 0) return null;

  return (
    <Inline spacing={1}>
      <Icon name={Icons.CHECK_CIRCLE} color={getGlobalValue('successColor')} />
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
