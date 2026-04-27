import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Scope } from '@/constants/OfferType';
import { useUpdateOfferFaqMutation } from '@/hooks/api/offers';
import RichTextEditor from '@/pages/RichTextEditor';
import { FaqItem } from '@/types/Offer';
import { Alert } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { TypeaheadInput } from '@/ui/TypeaheadInput';

const htmlToDraft =
  typeof window === 'object' && require('html-to-draftjs').default;

type SuggestionItem = { question: string; answer?: string };

type FaqModalProps = {
  visible: boolean;
  onClose: () => void;
  offerId: string;
  scope: Scope;
  language: string;
  initialFaqItems?: FaqItem[];
  editIndex?: number;
  onSuccessfulChange?: () => void;
  eventTypeId?: string;
  isCultuurkuur?: boolean;
};

const FaqModal = ({
  visible,
  onClose,
  offerId,
  scope,
  language,
  initialFaqItems = [],
  editIndex,
  onSuccessfulChange,
  eventTypeId,
  isCultuurkuur,
}: FaqModalProps) => {
  const { t, i18n } = useTranslation();

  const editItem =
    editIndex !== undefined
      ? initialFaqItems[editIndex]?.[language]
      : undefined;

  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [question, setQuestion] = useState(editItem?.question ?? '');
  const [answerEditorState, setAnswerEditorState] = useState(() => {
    if (editItem?.answer && htmlToDraft) {
      const draftState = htmlToDraft(editItem.answer);
      const contentState = ContentState.createFromBlockArray(
        draftState.contentBlocks,
        draftState.entityMap,
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const answerPlainText = answerEditorState.getCurrentContent().getPlainText();

  const eventType = isCultuurkuur ? 'cultuurkuur' : eventTypeId;
  const i18nKey = `create*additionalInformation*faq*modal*suggestions*${eventType}`;
  const suggestions: SuggestionItem[] =
    eventType && i18n.exists(i18nKey, { keySeparator: '*' })
      ? (t(i18nKey, {
          returnObjects: true,
          keySeparator: '*',
        }) as SuggestionItem[])
      : [];

  const answerHint = suggestions.find(
    (suggestion) => suggestion.question === question,
  )?.answer;

  const questionError = (() => {
    if (question.length > 255)
      return t(
        'create.additionalInformation.faq.modal.errors.question_too_long',
      );
    if (hasAttemptedSave && !question)
      return t('create.additionalInformation.faq.modal.errors.no_question');
  })();

  const answerError = (() => {
    if (answerPlainText.length > 5000)
      return t('create.additionalInformation.faq.modal.errors.answer_too_long');
    if (hasAttemptedSave && !answerEditorState.getCurrentContent().hasText())
      return t('create.additionalInformation.faq.modal.errors.no_answer');
  })();

  const updateFaqMutation = useUpdateOfferFaqMutation({
    onSuccess: () => {
      onSuccessfulChange?.();
    },
  });

  const handleSave = () => {
    setHasAttemptedSave(true);
    if (
      !question ||
      !answerEditorState.getCurrentContent().hasText() ||
      question.length > 255 ||
      answerPlainText.length > 5000
    )
      return;

    const updatedItem: FaqItem = {
      [language]: {
        question,
        answer: answerEditorState.getCurrentContent().hasText()
          ? draftToHtml(convertToRaw(answerEditorState.getCurrentContent()))
          : '',
      },
    };

    const updatedFaqs = [...initialFaqItems];
    if (editIndex !== undefined) {
      updatedFaqs[editIndex] = updatedItem;
    } else {
      updatedFaqs.push(updatedItem);
    }

    updateFaqMutation.mutate({
      id: offerId,
      scope,
      faq: updatedFaqs,
    });
    onClose();
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={visible}
      onClose={onClose}
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
          error={questionError}
          Component={
            <TypeaheadInput
              value={question}
              onChange={setQuestion}
              placeholder={t(
                'create.additionalInformation.faq.modal.question_placeholder',
              )}
              suggestions={suggestions.map((suggestion) => suggestion.question)}
            />
          }
        />
        <FormElement
          id="faq-answer"
          label={t('create.additionalInformation.faq.modal.answer')}
          error={answerError}
          Component={
            <RichTextEditor
              editorState={answerEditorState}
              onEditorStateChange={setAnswerEditorState}
            />
          }
        />
        {answerHint && <Alert>{answerHint}</Alert>}
      </Stack>
    </Modal>
  );
};

export { FaqModal };
export type { FaqModalProps };
