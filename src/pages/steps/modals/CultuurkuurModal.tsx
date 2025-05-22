import { sortBy } from 'lodash';
import { useMemo, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { CultuurKuurIcon } from '@/ui/CultuurKuurIcon';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalVariants } from '@/ui/Modal';
import { Stack, StackProps } from '@/ui/Stack';
import { colors } from '@/ui/theme';
import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';

type Props = {
  visible: boolean;
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  data: HierarchicalData[];
  selectedData: string[];
  translationKey?: string;
} & StackProps;

const sortByName = (entities: HierarchicalData['children']) =>
  sortBy(entities, 'name.nl');

const CultuurkuurModal = ({
  visible,
  data,
  selectedData,
  onConfirm,
  onClose,
  translationKey,
}: Props) => {
  const { t } = useTranslation();
  const title = t(`cultuurkuur_modal.title.${translationKey}`);

  const [, setSelected] = useState<string[]>([]);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const manager = useMemo(
    () => new CultuurkuurLabelsManager(data, selectedData, setSelected),
    [data, selectedData],
  );

  const toggleGroup = (groupName: string) =>
    setOpenGroup((prev) => (prev === groupName ? null : groupName));

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={() => onConfirm(manager.selected)}
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
        {manager.available.map((level1) => {
          const level1Identifier = manager.getIdentifier(level1);

          return (
            <Accordion key={level1Identifier} style={{ marginBottom: '2rem' }}>
              <Card>
                <Card.Header
                  css={`
                    cursor: ${level1.children?.length > 0
                      ? 'default'
                      : 'pointer'};
                    background-color: ${manager.isGroupFullySelected(level1)
                      ? colors.green5
                      : colors.grey1};
                  `}
                  onClick={() => manager.handleSelectionToggle(level1)}
                >
                  <Inline justifyContent="space-between" alignItems="center">
                    <p>{level1.name.nl}</p>
                    <CheckboxWithLabel
                      id={level1Identifier}
                      name={level1Identifier}
                      disabled={false}
                      onToggle={() => manager.handleSelectionToggle(level1)}
                      checked={manager.isGroupFullySelected(level1)}
                    >
                      {t(`cultuurkuur_modal.selectAll`)}
                    </CheckboxWithLabel>
                  </Inline>
                </Card.Header>
              </Card>
              {level1.children?.map((level2) => {
                const levelIdentifier = manager.getIdentifier(level2);
                const levelHasChildren = level2?.children?.length > 0;

                return (
                  <Card key={levelIdentifier}>
                    <Card.Header
                      css={`
                        background-color: ${manager.isGroupFullySelected(level2)
                          ? colors.green4
                          : 'transparent'};
                      `}
                    >
                      <Inline
                        justifyContent="space-between"
                        alignItems="center"
                        cursor="pointer"
                        onClick={() =>
                          levelHasChildren
                            ? toggleGroup(levelIdentifier)
                            : manager.handleSelectionToggle(level2)
                        }
                      >
                        <span>{level2.name.nl}</span>
                        {levelHasChildren ? (
                          <Icon
                            name={
                              openGroup === levelIdentifier
                                ? Icons.CHEVRON_DOWN
                                : Icons.CHEVRON_RIGHT
                            }
                          />
                        ) : (
                          <Checkbox
                            id={levelIdentifier}
                            name={levelIdentifier}
                            disabled={false}
                            onToggle={() =>
                              manager.handleSelectionToggle(level2)
                            }
                            checked={manager.isGroupFullySelected(level2)}
                          >
                            {manager.isGroupFullySelected(level2)
                              ? t('cultuurkuur_modal.clearAll')
                              : t('cultuurkuur_modal.selectAll')}
                          </Checkbox>
                        )}
                      </Inline>
                    </Card.Header>
                    {levelHasChildren && (
                      <Accordion.Collapse
                        eventKey={levelIdentifier}
                        in={openGroup === levelIdentifier}
                      >
                        <Card.Body>
                          <CheckboxWithLabel
                            className="selectAllLevel2"
                            id={levelIdentifier}
                            name={levelIdentifier}
                            disabled={false}
                            onToggle={() =>
                              manager.handleSelectionToggle(level2)
                            }
                            checked={manager.isGroupFullySelected(level2)}
                            marginBottom={4}
                          >
                            {manager.isGroupFullySelected(level2)
                              ? t('cultuurkuur_modal.clearAll')
                              : t('cultuurkuur_modal.selectAll')}
                          </CheckboxWithLabel>
                          <Box
                            css={`
                              display: grid;
                              grid-template-columns: repeat(4, 1fr);
                              gap: 1rem;
                            `}
                          >
                            {sortByName(level2.children).map((leaf) => (
                              <Button
                                key={manager.getIdentifier(leaf)}
                                width="auto"
                                active={manager.isLabelSelected(
                                  manager.getIdentifier(leaf),
                                )}
                                display="inline-flex"
                                variant={ButtonVariants.SECONDARY_TOGGLE}
                                onClick={() => {
                                  manager.handleSelectionToggle(leaf);
                                }}
                              >
                                {leaf.name.nl}
                              </Button>
                            ))}
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
