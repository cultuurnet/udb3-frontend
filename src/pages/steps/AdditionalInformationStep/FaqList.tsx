import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SupportedLanguages } from '@/i18n/index';
import { FaqItem } from '@/types/Offer';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Panel } from '@/ui/Panel';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

const getPanelValue = getValueFromTheme('panel');

type FaqListProps = {
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
          <div
            key={index}
            className="tw:flex tw:flex-col tw:gap-1 tw:p-4"
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
            <div className="tw:flex tw:justify-between tw:items-center">
              <Text fontWeight="500">{item.question}</Text>
              <div className="tw:flex tw:gap-2">
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={() => onEdit(index)}
                >
                  {t('create.additionalInformation.faq.edit')}
                </Button>
                <Button
                  variant={ButtonVariants.LINK_DANGER}
                  onClick={() => setDeletingIndex(index)}
                >
                  {t('create.additionalInformation.faq.delete')}
                </Button>
              </div>
            </div>
            <Text
              color={colors.grey5}
              css={`
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                overflow: hidden;
              `}
              dangerouslySetInnerHTML={{
                __html: sanitizeDom(
                  item.answer,
                  sanitizationPresets.EVENT_DESCRIPTION,
                ),
              }}
            />
          </div>
        );
      })}
      <div className="tw:p-4">{action}</div>
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
