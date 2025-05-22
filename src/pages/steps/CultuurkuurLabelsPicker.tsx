import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { CultuurkuurSelectionOverview } from '@/pages/steps/CultuurkuurSelectionOverview';
import { CultuurkuurModal } from '@/pages/steps/modals/CultuurkuurModal';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';

type Props = {
  data: HierarchicalData[];
  selected?: string[];
  onConfirm?: (newSelected: string[]) => void;
  translationKey: string;
};

const CultuurkuurLabelsPicker = ({
  data,
  selected = [],
  onConfirm = () => ({}),
  translationKey,
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
          <span>{t(`cultuurkuur_modal.title.${translationKey}`)}</span>
        </Inline>
      </Button>
      {isCultuurkuurLocationModalVisible && (
        <CultuurkuurModal
          visible
          data={data}
          selectedData={selected}
          translationKey={translationKey}
          onConfirm={(newSelected) => {
            setIsCultuurkuurLocationModalVisible(false);
            onConfirm(newSelected);
          }}
          onClose={() => setIsCultuurkuurLocationModalVisible(false)}
        />
      )}
      <CultuurkuurSelectionOverview data={data} selectedData={selected} />
    </>
  );
};

export { CultuurkuurLabelsPicker };
