import { CultuurkuurModal } from '@/pages/steps/modals/CultuurkuurModal';
import { CultuurkuurSelectionOverview } from '@/pages/steps/CultuurkuurSelectionOverview';
import React, { useState } from 'react';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Icon, Icons } from '@/ui/Icon';
import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { useTranslation } from 'react-i18next';

type Props = {
  data: HierarchicalData[];
  selected?: string[];
  onConfirm?: (newSelected: string[]) => void;
};

const CultuurkuurLabelsPicker = ({
  data,
  selected = [],
  onConfirm = () => ({}),
}: Props) => {
  const { t } = useTranslation();
  const [
    isCultuurkuurLocationModalVisible,
    setIsCultuurkuurLocationModalVisible,
  ] = useState(false);

  return (
    <>
      <Button
        variant={ButtonVariants.LINK}
        onClick={() => setIsCultuurkuurLocationModalVisible(true)}
      >
        <Inline spacing={2}>
          <Icon name={Icons.PLUS_CIRCLE} />
          <span>Add province region gemeente</span>
        </Inline>
      </Button>
      <CultuurkuurModal
        visible={isCultuurkuurLocationModalVisible}
        data={data}
        selectedData={selected}
        title={t('cultuurkuur_modal.location.title')}
        onConfirm={(newSelected) => {
          setIsCultuurkuurLocationModalVisible(false);
          onConfirm(newSelected);
        }}
        onClose={() => setIsCultuurkuurLocationModalVisible(false)}
      />
      <CultuurkuurSelectionOverview data={data} selectedData={selected} />
    </>
  );
};

export { CultuurkuurLabelsPicker };
