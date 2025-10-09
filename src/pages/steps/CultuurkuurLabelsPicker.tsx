import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { CultuurkuurSelectionOverview } from '@/pages/steps/CultuurkuurSelectionOverview';
import { CultuurkuurModal } from '@/pages/steps/modals/CultuurkuurModal';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';

type Props = {
  data: HierarchicalData[];
  selectedData: string[];
  onConfirm?: (newSelected: string[], translationKey: string) => void;
  labelsKey: string;
};

const CultuurkuurLabelsPicker = ({
  data,
  selectedData,
  labelsKey,
  onConfirm,
}: Props) => {
  const { t } = useTranslation();
  const [isCultuurkuurModalVisible, setIsCultuurkuurModalVisible] =
    useState(false);

  const flatData = useMemo(() => {
    const flatten = (nodes: HierarchicalData[]): HierarchicalData[] =>
      nodes.flatMap((node) => [
        node,
        ...(node.children ? flatten(node.children) : []),
      ]);

    return data ? flatten(data) : [];
  }, [data]);

  const preSelectedValues = useMemo(() => {
    return flatData.filter((data) => selectedData.includes(data.label));
  }, [flatData, selectedData]);

  const hasPreselectedValues = preSelectedValues.length === 0;

  return (
    <>
      {hasPreselectedValues && (
        <Button
          variant={ButtonVariants.LINK}
          paddingLeft={0}
          marginBottom={hasPreselectedValues ? 0 : 4}
          onClick={() => setIsCultuurkuurModalVisible(true)}
        >
          <Inline spacing={2}>
            <Icon name={Icons.PLUS_CIRCLE} />
            <span>{t(`cultuurkuur_modal.title.${labelsKey}`)}</span>
          </Inline>
        </Button>
      )}
      {isCultuurkuurModalVisible && (
        <CultuurkuurModal
          visible
          title={t(`cultuurkuur_modal.title.${labelsKey}`)}
          checkboxTitle={t('cultuurkuur_modal.selectAll')}
          data={data}
          labelsKey={labelsKey}
          selectedData={preSelectedValues}
          onConfirm={(selectedEntities) => {
            setIsCultuurkuurModalVisible(false);
            onConfirm(selectedEntities, labelsKey);
          }}
          onClose={() => setIsCultuurkuurModalVisible(false)}
        />
      )}
      <CultuurkuurSelectionOverview
        selectedData={preSelectedValues}
        onOpenModal={() => setIsCultuurkuurModalVisible(true)}
        labelsKey={labelsKey}
      />
    </>
  );
};

export { CultuurkuurLabelsPicker };
