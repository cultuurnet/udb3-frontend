import { sortBy } from 'lodash';
import { useMemo, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { CultuurKuurIcon } from '@/ui/CultuurKuurIcon';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalVariants } from '@/ui/Modal';
import { Stack, StackProps } from '@/ui/Stack';
import { colors } from '@/ui/theme';

type Props = {
  visible: boolean;
  onConfirm: (selectedEntities: HierarchicalData[]) => void;
  onClose: () => void;
  data: HierarchicalData[];
  selectedData: HierarchicalData[];
  title: string;
  checkboxTitle: string;
} & StackProps;

const sortByName = (entities: HierarchicalData['children']) =>
  sortBy(entities, 'name.nl');

const CultuurkuurModal = ({
  visible,
  title,
  checkboxTitle,
  data,
  selectedData,
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslation();

  const level1Entities = data.map((entry) => entry);

  const [selectedEntities, setSelectedEntities] = useState(selectedData);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const selectedLabels = useMemo(
    () => selectedEntities.map((selected) => selected.label),
    [selectedEntities],
  );

  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  const isGroupFullySelected = (level1Entity: HierarchicalData) => {
    const allLeafEntities = level1Entity.children.flatMap(
      (level2) => level2.children,
    );

    return (
      selectedLabels.includes(level1Entity.label) ||
      allLeafEntities.every((leaf) => selectedLabels.includes(leaf.label))
    );
  };

  const handleSelectionToggle = (entity: HierarchicalData) => {
    const isGroup = !!entity.children;

    setSelectedEntities((prev) => {
      const alreadySelected = prev.some((e) => e.name.nl === entity.name.nl);

      if (alreadySelected) {
        return prev.filter((e) => e.name.nl !== entity.name.nl);
      }

      if (isGroup) {
        const allLeafEntities = entity.children.flatMap(
          (level2) => level2.children,
        );
        if (isGroupFullySelected(entity)) {
          return prev.filter(
            (sel) =>
              !allLeafEntities.some((leaf) => leaf.name.nl === sel.name.nl),
          );
        }
        return [...prev, ...allLeafEntities, entity];
      }

      return [...prev, entity];
    });
  };

  const areAllLeafsSelected = (leafEntities: HierarchicalData[]) =>
    leafEntities.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );

  const toggleSelectAllLeafs = (leafEntities: HierarchicalData[]) => {
    const allSelected = areAllLeafsSelected(leafEntities);
    if (allSelected) {
      setSelectedEntities((prev) =>
        prev.filter(
          (sel) => !leafEntities.some((leaf) => leaf.name.nl === sel.name.nl),
        ),
      );
    } else {
      const newSelections = leafEntities.filter(
        (leaf) => !selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
      );
      setSelectedEntities((prev) => [...prev, ...newSelections]);
    }
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={() => onConfirm(selectedEntities)}
      onClose={onClose}
      title={
        <>
          <span>{title}</span>
          <CultuurKuurIcon marginLeft={2} />
        </>
      }
      confirmTitle={t('cultuurkuur_modal.save')}
      cancelTitle={t('cultuurkuur_modal.cancel')}
      size="lg"
    >
      <Stack padding={4} spacing={5}>
        {level1Entities.map((level1) => (
          <Accordion
            key={level1.name.nl}
            css={`
              margin-bottom: 2rem;
            `}
          >
            <Card>
              <Card.Header
                css={`
                  background-color: ${colors.grey1};
                `}
              >
                <Inline
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => handleSelectionToggle(level1)}
                >
                  <p>{level1.name.nl}</p>

                  <CheckboxWithLabel
                    className="selectAllLevel1"
                    id={level1.name}
                    name={level1.name}
                    disabled={false}
                    onToggle={() => handleSelectionToggle(level1)}
                    checked={isGroupFullySelected(level1)}
                  >
                    {checkboxTitle}
                  </CheckboxWithLabel>
                </Inline>
              </Card.Header>
            </Card>
            {level1.children.map((level2) => (
              <Card key={level2.name.nl}>
                <Card.Header
                  css={`
                    background-color: transparent;
                  `}
                >
                  <Inline
                    justifyContent="space-between"
                    alignItems="center"
                    cursor="pointer"
                    onClick={() => toggleGroup(level2.name.nl)}
                  >
                    <span>{level2.name.nl}</span>
                    <Icon
                      name={
                        openGroup === level2.name.nl
                          ? Icons.CHEVRON_DOWN
                          : Icons.CHEVRON_RIGHT
                      }
                    />
                  </Inline>
                </Card.Header>
                <Accordion.Collapse
                  eventKey={level2.name.nl}
                  in={openGroup === level2.name.nl}
                >
                  <Card.Body>
                    <Inline justifyContent="flex-start" marginBottom={4}>
                      <Button
                        variant={ButtonVariants.LINK}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectAllLeafs(level2.children);
                        }}
                      >
                        {areAllLeafsSelected(level2.children)
                          ? t('cultuurkuur_modal.clearAll')
                          : t('cultuurkuur_modal.selectAll')}
                      </Button>
                    </Inline>
                    <Box
                      css={`
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1rem;
                      `}
                    >
                      {sortByName(level2.children).map((leaf) => (
                        <Button
                          key={leaf.name.nl}
                          width="auto"
                          active={selectedLabels.includes(leaf.label)}
                          display="inline-flex"
                          variant={ButtonVariants.SECONDARY_TOGGLE}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectionToggle(leaf);
                          }}
                        >
                          {leaf.name.nl}
                        </Button>
                      ))}
                    </Box>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            ))}
          </Accordion>
        ))}
      </Stack>
    </Modal>
  );
};

export { CultuurkuurModal };
