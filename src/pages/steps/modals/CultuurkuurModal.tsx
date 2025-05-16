import { sortBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
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
import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';

type Props = {
  visible: boolean;
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  data: HierarchicalData[];
  selectedData: string[];
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

  const [selected, setSelected] = useState<string[]>([]);
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
        {manager.available.map((level1) => (
          <Accordion key={level1.label} style={{ marginBottom: '2rem' }}>
            <Card>
              <Card.Header
                css={`
                  background-color: ${manager.isGroupFullySelected(level1)
                    ? colors.green5
                    : colors.grey1};
                `}
              >
                <Inline
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => manager.handleSelectionToggle(level1)}
                >
                  <p>{level1.name.nl}</p>
                  <CheckboxWithLabel
                    className="selectAllLevel1"
                    id={level1.label}
                    name={level1.name}
                    disabled={false}
                    onToggle={() => manager.handleSelectionToggle(level1)}
                    checked={manager.isGroupFullySelected(level1)}
                  >
                    {checkboxTitle}
                  </CheckboxWithLabel>
                </Inline>
              </Card.Header>
            </Card>
            {level1.children.map((level2) => (
              <Card key={level2.label}>
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
                    onClick={() => toggleGroup(level2.label)}
                  >
                    <span>{level2.name.nl}</span>
                    <Icon
                      name={
                        openGroup === level2.label
                          ? Icons.CHEVRON_DOWN
                          : Icons.CHEVRON_RIGHT
                      }
                    />
                  </Inline>
                </Card.Header>
                <Accordion.Collapse
                  eventKey={level2.label}
                  in={openGroup === level2.label}
                >
                  <Card.Body>
                    <Inline justifyContent="flex-start" marginBottom={4}>
                      <Button
                        variant={ButtonVariants.LINK}
                        onClick={(e) => {
                          manager.toggleSelectAllLeafs(level2.children);
                        }}
                      >
                        {manager.isGroupFullySelected(level2)
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
                          key={leaf.label}
                          width="auto"
                          active={manager.isLabelSelected(leaf.label)}
                          display="inline-flex"
                          variant={ButtonVariants.SECONDARY_TOGGLE}
                          onClick={(e) => {
                            manager.handleSelectionToggle(leaf);
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
