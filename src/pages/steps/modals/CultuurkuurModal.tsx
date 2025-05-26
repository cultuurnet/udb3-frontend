import { useState } from 'react';
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
import {
  addWithParents,
  dataToLabels,
  expandLevel1WithChildren,
  getAllLeafNodes,
  handleSelectedLocations,
  removeAndCleanParents,
  sortByName,
} from '@/utils/cultuurkuurLabels';

type Props = {
  visible: boolean;
  onConfirm: (selectedEntities: string[]) => void;
  onClose: () => void;
  data: HierarchicalData[];
  selectedData: HierarchicalData[];
  title: string;
  checkboxTitle: string;
  labelsKey: string;
} & StackProps;

const CultuurkuurModal = ({
  visible,
  title,
  checkboxTitle,
  data = [],
  selectedData = [],
  labelsKey,
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [selectedEntities, setSelectedEntities] = useState<HierarchicalData[]>(
    labelsKey === 'location'
      ? expandLevel1WithChildren(selectedData)
      : selectedData,
  );

  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  // Level1
  const isGroupFullySelected = (entity: HierarchicalData) => {
    const leaves = getAllLeafNodes(entity);

    return leaves.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );
  };

  // Select whole group
  const handleSelectionToggle = (entity: HierarchicalData) => {
    const leaves = getAllLeafNodes(entity);
    const isEducationLabel = !entity.label
      .toLowerCase()
      .includes('werkingsregio');

    setSelectedEntities((prev) => {
      const allSelected = leaves.every((leaf) =>
        prev.some((sel) => sel.name.nl === leaf.name.nl),
      );

      if (allSelected) {
        let updated = prev.filter(
          (sel) => !leaves.some((leaf) => leaf.name.nl === sel.name.nl),
        );

        if (isEducationLabel) {
          leaves.forEach((leaf) => {
            updated = removeAndCleanParents(leaf, updated, data);
          });
        }

        return updated;
      } else {
        let updated = [...prev];
        const newSelections = leaves.filter(
          (leaf) => !prev.some((sel) => sel.name.nl === leaf.name.nl),
        );
        updated.push(...newSelections);

        if (isEducationLabel) {
          newSelections.forEach((leaf) => {
            addWithParents(leaf, updated, data);
          });
        }

        return updated;
      }
    });
  };

  const handleSelectionToggleEducation = (entity: HierarchicalData) => {
    setSelectedEntities((prev) => {
      let updated = [...prev];
      const isSelected = updated.some((e) => e.name.nl === entity.name.nl);

      if (isSelected) {
        updated = removeAndCleanParents(entity, updated, data);
      } else {
        addWithParents(entity, updated, data);
      }

      return updated;
    });
  };

  // Level2 children
  const areAllLeafsSelected = (entities: HierarchicalData[] = []) => {
    const allLeaves = entities.flatMap(getAllLeafNodes);
    return allLeaves.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );
  };

  // Select All - Clear All
  const toggleSelectAllLeafs = (entities: HierarchicalData[] = []) => {
    const allLeaves = entities.flatMap(getAllLeafNodes);

    const isEducationLabel = !entities.some((e) =>
      e.label.toLowerCase().includes('werkingsregio'),
    );

    const allSelected = allLeaves.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );

    if (allSelected) {
      setSelectedEntities((prev) => {
        let updated = prev.filter(
          (sel) => !allLeaves.some((leaf) => leaf.name.nl === sel.name.nl),
        );

        if (isEducationLabel) {
          allLeaves.forEach((leaf) => {
            updated = removeAndCleanParents(leaf, updated, data);
          });
        }

        return updated;
      });
    } else {
      setSelectedEntities((prev) => {
        const updated = [...prev];
        allLeaves.forEach((leaf) => {
          if (!updated.some((e) => e.name.nl === leaf.name.nl)) {
            if (isEducationLabel) {
              addWithParents(leaf, updated, data);
            } else {
              updated.push(leaf);
            }
          }
        });
        return updated;
      });
    }
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={() =>
        onConfirm(
          labelsKey === 'location'
            ? handleSelectedLocations(selectedEntities, data)
            : dataToLabels(selectedEntities),
        )
      }
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
        {data.map((level1) => {
          const level1Name = level1?.name?.nl || '';
          const hasChildren = (level1?.children?.length || 0) > 0;

          return (
            <Accordion
              key={level1Name}
              css={`
                margin-bottom: 2rem;
              `}
            >
              <Card>
                <Card.Header
                  css={`
                    background-color: ${isGroupFullySelected(level1)
                      ? colors.green5
                      : colors.grey1};
                  `}
                >
                  <Inline justifyContent="space-between" alignItems="center">
                    <p>{level1Name}</p>
                    <CheckboxWithLabel
                      className="selectAllLevel1"
                      id={level1Name}
                      name={level1Name}
                      onToggle={() => handleSelectionToggle(level1)}
                      checked={isGroupFullySelected(level1)}
                    >
                      {hasChildren ? checkboxTitle : ''}
                    </CheckboxWithLabel>
                  </Inline>
                </Card.Header>
              </Card>

              {level1.children?.map((level2) => {
                const level2Name = level2?.name?.nl || '';
                const hasChildren = (level2?.children?.length || 0) > 0;

                return (
                  <Card key={level2Name}>
                    <Card.Header
                      css={`
                        background-color: ${isGroupFullySelected(level2)
                          ? colors.green4
                          : 'transparent'};
                      `}
                    >
                      {hasChildren ? (
                        <Inline
                          justifyContent="space-between"
                          alignItems="center"
                          cursor="pointer"
                          onClick={() => toggleGroup(level2Name)}
                        >
                          <span>{level2Name}</span>
                          <Icon
                            name={
                              openGroup === level2Name
                                ? Icons.CHEVRON_DOWN
                                : Icons.CHEVRON_RIGHT
                            }
                          />
                        </Inline>
                      ) : (
                        <Inline
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <p>{level2Name}</p>
                          <CheckboxWithLabel
                            id={level2Name}
                            name={level2Name}
                            onToggle={() =>
                              labelsKey === 'education'
                                ? handleSelectionToggleEducation(level2)
                                : handleSelectionToggle(level2)
                            }
                            checked={selectedEntities.some(
                              (e) => e?.name?.nl === level2Name,
                            )}
                          />
                        </Inline>
                      )}
                    </Card.Header>

                    {hasChildren && (
                      <Accordion.Collapse
                        eventKey={level2Name}
                        in={openGroup === level2Name}
                      >
                        <Card.Body>
                          <Inline justifyContent="flex-start" marginBottom={4}>
                            <Button
                              variant={ButtonVariants.LINK}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectAllLeafs(level2.children || []);
                              }}
                            >
                              {areAllLeafsSelected(level2.children || [])
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
                            {sortByName(level2.children)?.map((leaf) => {
                              const leafName = leaf?.name?.nl || '';
                              return (
                                <Button
                                  key={leafName}
                                  width="auto"
                                  active={selectedEntities.some(
                                    (e) => e?.name?.nl === leafName,
                                  )}
                                  display="inline-flex"
                                  variant={ButtonVariants.SECONDARY_TOGGLE}
                                  onClick={(e) => {
                                    labelsKey === 'education'
                                      ? handleSelectionToggleEducation(leaf)
                                      : handleSelectionToggle(leaf);
                                  }}
                                >
                                  {leafName}
                                </Button>
                              );
                            })}
                          </Box>
                        </Card.Body>
                      </Accordion.Collapse>
                    )}
                  </Card>
                );
              })}
            </Accordion>
          );
        })}
      </Stack>
    </Modal>
  );
};

export { CultuurkuurModal };
