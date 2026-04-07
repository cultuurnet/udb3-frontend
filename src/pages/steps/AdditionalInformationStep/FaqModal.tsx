import { convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Scope } from '@/constants/OfferType';
import { useUpdateOfferFaqMutation } from '@/hooks/api/offers';
import RichTextEditor from '@/pages/RichTextEditor';
import { FaqItem } from '@/types/Offer';
import { FormElement } from '@/ui/FormElement';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { TypeaheadInput } from '@/ui/TypeaheadInput';

type FaqModalProps = {
  visible: boolean;
  onClose: () => void;
  offerId: string;
  scope: Scope;
  language: string;
  initialFaqItems?: FaqItem[];
  onSuccessfulChange?: () => void;
};

const FaqModal = ({
  visible,
  onClose,
  offerId,
  scope,
  language,
  initialFaqItems = [],
  onSuccessfulChange,
}: FaqModalProps) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answerEditorState, setAnswerEditorState] = useState(
    EditorState.createEmpty(),
  );

  const handleReset = () => {
    setQuestion('');
    setAnswerEditorState(EditorState.createEmpty());
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const updateFaqMutation = useUpdateOfferFaqMutation({
    onSuccess: () => {
      handleReset();
      onSuccessfulChange?.();
    },
  });

  const handleSave = () => {
    const newItem: FaqItem = {
      [language]: {
        question,
        answer: answerEditorState.getCurrentContent().hasText()
          ? draftToHtml(convertToRaw(answerEditorState.getCurrentContent()))
          : '',
      },
    };
    updateFaqMutation.mutate({
      id: offerId,
      scope,
      faq: [...initialFaqItems, newItem],
    });
    onClose();
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onClose={handleClose}
      onConfirm={handleSave}
      title={t('create.additionalInformation.faq.modal.title')}
      confirmTitle={t('create.additionalInformation.faq.modal.save')}
      cancelTitle={t('create.additionalInformation.faq.modal.cancel')}
      size={ModalSizes.LG}
    >
      <Stack padding={4} spacing={4}>
        <FormElement
          id="faq-question"
          label={t('create.additionalInformation.faq.modal.question')}
          Component={
            <TypeaheadInput
              value={question}
              onChange={setQuestion}
              placeholder={t(
                'create.additionalInformation.faq.modal.question_placeholder',
              )}
              suggestions={
                t('create.additionalInformation.faq.modal.suggestions', {
                  returnObjects: true,
                }) as string[]
              }
            />
          }
        />
        <FormElement
          id="faq-answer"
          label={t('create.additionalInformation.faq.modal.answer')}
          Component={
            <RichTextEditor
              editorState={answerEditorState}
              onEditorStateChange={setAnswerEditorState}
            />
          }
        />
      </Stack>
    </Modal>
  );
};

export { FaqModal };
export type { FaqModalProps };
