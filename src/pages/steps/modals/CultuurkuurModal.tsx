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
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import {
  getAllLeafNodes,
  sortByName,
  useLabelsManager,
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
  const {
    isGroupFullySelected,
    handleSelectionToggle,
    isSelected,
    getSelected,
    areAllLeafsSelected,
    toggleSelectAllLeafs,
  } = useLabelsManager(labelsKey, data, selectedData);

  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={() => onConfirm(getSelected())}
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
                    background-color: ${colors.grey1};
                  `}
                >
                  <Inline justifyContent="space-between" alignItems="center">
                    <Text>{level1Name}</Text>
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
                const leafs = getAllLeafNodes(level2);
                const selectedCount = leafs.filter(isSelected).length;

                return (
                  <Card key={level2Name}>
                    <Card.Header
                      css={`
                        background-color: transparent;
                      `}
                    >
                      {hasChildren ? (
                        <Inline
                          justifyContent="space-between"
                          alignItems="center"
                          cursor="pointer"
                          onClick={() => toggleGroup(level2Name)}
                        >
                          <Box display="flex" alignItems="baseline">
                            <p>{level2Name}</p>
                            {selectedCount > 0 && (
                              <span
                                className="badge badge-pill badge-success ml-1"
                                css={`
                                  background-color: ${colors.udbMainPositiveGreen} !important;
                                `}
                              >
                                {selectedCount}
                              </span>
                            )}
                          </Box>

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
                            onToggle={() => handleSelectionToggle(level2)}
                            checked={isSelected(level2)}
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
                                  active={isSelected(leaf)}
                                  display="inline-flex"
                                  variant={ButtonVariants.SECONDARY_TOGGLE}
                                  onClick={() => handleSelectionToggle(leaf)}
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
