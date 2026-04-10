import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SupportedLanguages } from '@/i18n/index';
import { FaqItem } from '@/types/Offer';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Panel } from '@/ui/Panel';
import { Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

const getPanelValue = getValueFromTheme('panel');

type FaqListProps = StackProps & {
  faqs: FaqItem[];
  language: Values<typeof SupportedLanguages>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  action: ReactNode;
};

const FaqList = ({
  faqs,
  language,
  onEdit,
  onDelete,
  action,
}: FaqListProps) => {
  const { t } = useTranslation();
  const [deletingIndex, setDeletingIndex] = useState<number | undefined>(
    undefined,
  );

  return (
    <Panel width="100%">
      {faqs.map((faq, index) => {
        const item = faq[language];
        if (!item) return null;
        return (
          <Stack
            key={index}
            spacing={2}
            padding={4}
            css={`
              background-image: linear-gradient(
                ${getPanelValue('borderColor')},
                ${getPanelValue('borderColor')}
              );
              background-size: calc(100% - 2rem) 1px;
              background-position: center bottom;
              background-repeat: no-repeat;
            `}
          >
            <Inline justifyContent="space-between" alignItems="center">
              <Text fontWeight="500">{item.question}</Text>
              <Inline spacing={3}>
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={() => onEdit(index)}
                >
                  {t('create.additionalInformation.faq.edit')}
                </Button>
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={() => setDeletingIndex(index)}
                  css={`
                    span {
                      color: ${colors.dangerDark};
                    }
                    &:hover span {
                      color: ${colors.dangerBright};
                      text-decoration-color: ${colors.dangerBright};
                    }
                  `}
                >
                  {t('create.additionalInformation.faq.delete')}
                </Button>
              </Inline>
            </Inline>
            <Text
              color={colors.grey5}
              css={`
                line-height: 1.5;
                max-height: 6em;
                overflow: hidden;
              `}
              dangerouslySetInnerHTML={{
                __html: sanitizeDom(
                  item.answer,
                  sanitizationPresets.EVENT_DESCRIPTION,
                ),
              }}
            />
          </Stack>
        );
      })}
      <Inline padding={4}>{action}</Inline>
      <Modal
        variant={ModalVariants.QUESTION}
        size={ModalSizes.MD}
        visible={deletingIndex !== undefined}
        title={t('create.additionalInformation.faq.delete_modal.title')}
        confirmTitle={t(
          'create.additionalInformation.faq.delete_modal.confirm',
        )}
        cancelTitle={t('create.additionalInformation.faq.delete_modal.cancel')}
        onClose={() => setDeletingIndex(undefined)}
        onConfirm={() => {
          if (deletingIndex !== undefined) {
            onDelete(deletingIndex);
            setDeletingIndex(undefined);
          }
        }}
        confirmButtonVariant={ButtonVariants.DANGER}
        css={`
          .modal-footer .btn-danger {
            background-color: ${colors.dangerBright};
            border-color: ${colors.dangerBright};
          }
          .modal-footer .btn-danger:hover {
            background-color: ${colors.dangerDark};
            border-color: ${colors.dangerDark};
          }
        `}
      >
        <Box padding={4}>
          <Text>{t('create.additionalInformation.faq.delete_modal.body')}</Text>
        </Box>
      </Modal>
    </Panel>
  );
};

export { FaqList };
export type { FaqListProps };
