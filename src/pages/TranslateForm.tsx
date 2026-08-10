import { useQueryClient } from '@tanstack/react-query';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OfferTypes } from '@/constants/OfferType';
import {
  useChangeOfferDescriptionMutation,
  useChangeOfferNameMutation,
  useGetOfferByIdQuery,
  useUpdateOfferFaqMutation,
} from '@/hooks/api/offers';
import { useToast } from '@/hooks/useToast';
import { TranslationLanguages } from '@/i18n/index';
import RichTextEditor from '@/pages/RichTextEditor';
import type { FaqItem } from '@/types/Offer';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Panel } from '@/ui/Panel';
import { Stack } from '@/ui/Stack';
import { Tabs, TabsVariants } from '@/ui/Tabs';
import { Text } from '@/ui/Text';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

import { DescriptionPreview } from './preview/DescriptionPreview';

const htmlToDraft =
  typeof window === 'object' && require('html-to-draftjs').default;

const createEditorStateFromHtml = (html: string | undefined): EditorState => {
  if (!html || !htmlToDraft) return EditorState.createEmpty();
  const draftState = htmlToDraft(html);
  const contentState = ContentState.createFromBlockArray(
    draftState.contentBlocks,
    draftState.entityMap,
  );
  return EditorState.createWithContent(contentState);
};

const getPlainText = (editorState: EditorState) =>
  editorState.getCurrentContent().getPlainText().trim();

const languageOptions = Object.values(TranslationLanguages);
const getGlobalValue = getValueFromTheme('global');
const getTextValue = getValueFromTheme('text');

const rowGridCss = `
  grid-template-columns: 150px 1fr;
  gap: 28px;
`;

const TranslateTabs = {
  TITLE: 'title',
  DESCRIPTION: 'description',
  FAQ: 'faq',
} as const;

type TabTitleProps = {
  label: string;
  hasFilled: boolean;
};

const TabTitle = ({ label, hasFilled }: TabTitleProps) => (
  <Inline spacing={3} alignItems="center">
    {hasFilled && (
      <Icon name={Icons.CHECK_CIRCLE} className="tw:text-success" />
    )}
    <Text>{label}</Text>
  </Inline>
);

const ContentPanel = ({ children }: { children: React.ReactNode }) => (
  <Stack
    marginTop={4}
    backgroundColor={colors.white}
    padding={4}
    spacing={5}
    borderRadius={getGlobalBorderRadius}
    css={`
      box-shadow: ${getGlobalValue('boxShadow.medium')};
    `}
  >
    {children}
  </Stack>
);

type TranslateFormBaseProps = {
  language: string;
  originalLanguage: string;
  isEditingOriginal: boolean;
  onStartEditing: () => void;
};

type TitleFieldProps = TranslateFormBaseProps & {
  value: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
};

const TitleField = ({
  language,
  originalLanguage,
  isEditingOriginal,
  onStartEditing,
  value,
  onChange,
  onBlur,
}: TitleFieldProps) => {
  const { t } = useTranslation();

  return (
    <Stack display="grid" alignItems="center" css={rowGridCss}>
      <Text variant="muted">
        {originalLanguage === language
          ? t('translate.original_label', { language })
          : t('translate.translation_label', { language })}
      </Text>
      {originalLanguage === language && !isEditingOriginal ? (
        <Inline spacing={3}>
          <Text variant="muted">{value}</Text>
          <Button onClick={onStartEditing} variant={ButtonVariants.LINK}>
            {t('translate.change')}
          </Button>
        </Inline>
      ) : (
        <FormElement
          id={`translate-title-${language}`}
          Component={
            <Input
              placeholder={t('translate.placeholder_title', { language })}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(e.target.value)
              }
              onBlur={(e) => onBlur(e.target.value)}
            />
          }
        />
      )}
    </Stack>
  );
};

type DescriptionFieldProps = TranslateFormBaseProps & {
  description: string;
  editorState: EditorState;
  onEditorStateChange: (state: EditorState) => void;
  onBlur: () => void;
};

const DescriptionField = ({
  language,
  originalLanguage,
  isEditingOriginal,
  onStartEditing,
  description,
  editorState,
  onEditorStateChange,
  onBlur,
}: DescriptionFieldProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      id={`description-container-${language}`}
      display="grid"
      css={rowGridCss}
      maxWidth="55rem"
    >
      <Text variant="muted">
        {originalLanguage === language
          ? t('translate.original_label', { language })
          : t('translate.translation_label', { language })}
      </Text>
      {originalLanguage === language && !isEditingOriginal ? (
        <Stack spacing={3}>
          <Panel padding={3} color={getTextValue('muted.color')}>
            <DescriptionPreview description={description} />
          </Panel>
          <Button variant={ButtonVariants.LINK} onClick={onStartEditing}>
            {t('translate.change')}
          </Button>
        </Stack>
      ) : (
        <FormElement
          id={`create-description-${language}`}
          Component={
            <RichTextEditor
              editorState={editorState}
              onEditorStateChange={onEditorStateChange}
              onBlur={onBlur}
            />
          }
        />
      )}
    </Stack>
  );
};

type FaqValues = {
  questions: Record<string, string>;
  answerStates: Record<string, EditorState>;
};

type FaqFieldProps = {
  faqIndex: number;
  originalLanguage: string;
  translationLanguages: string[];
  faqItem: FaqItem;
  isEditingOriginal: boolean;
  onStartEditing: () => void;
  values: FaqValues;
  onQuestionChange: (language: string, value: string) => void;
  onAnswerStateChange: (language: string, state: EditorState) => void;
  onSave: (language: string) => void;
};

const FaqField = ({
  faqIndex,
  originalLanguage,
  translationLanguages,
  faqItem,
  isEditingOriginal,
  onStartEditing,
  values,
  onQuestionChange,
  onAnswerStateChange,
  onSave,
}: FaqFieldProps) => {
  const { t } = useTranslation();
  const key = (lang: string) => `${faqIndex}_${lang}`;

  return (
    <Stack spacing={4} maxWidth="55rem">
      {faqIndex > 0 && <Box height="1px" backgroundColor={colors.grey3} />}
      <Text className="tw:font-bold">
        {t('translate.faq.title', { index: faqIndex + 1 })}
      </Text>
      <Stack display="grid" css={rowGridCss}>
        <Text variant="muted">
          {t('translate.original_label', { language: originalLanguage })}
        </Text>
        {isEditingOriginal ? (
          <Stack spacing={3}>
            <Input
              value={values.questions[key(originalLanguage)] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onQuestionChange(originalLanguage, e.target.value)
              }
              onBlur={() => onSave(originalLanguage)}
            />
            <RichTextEditor
              editorState={
                values.answerStates[key(originalLanguage)] ??
                EditorState.createEmpty()
              }
              onEditorStateChange={(state) =>
                onAnswerStateChange(originalLanguage, state)
              }
              onBlur={() => onSave(originalLanguage)}
            />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Inline justifyContent="space-between">
              <Text className="tw:font-bold">
                {faqItem[originalLanguage]?.question ?? ''}
              </Text>
              <Button variant={ButtonVariants.LINK} onClick={onStartEditing}>
                {t('translate.change')}
              </Button>
            </Inline>
            <DescriptionPreview
              description={faqItem[originalLanguage]?.answer ?? ''}
            />
          </Stack>
        )}
      </Stack>
      {translationLanguages.map((language) => (
        <Stack
          key={`faq-${faqIndex}-${language}`}
          id={`faq-translation-${faqIndex}-${language}`}
          display="grid"
          css={rowGridCss}
        >
          <Text variant="muted">
            {t('translate.translation_label', { language })}
          </Text>
          <Stack spacing={3}>
            <Input
              placeholder={t('translate.faq.placeholder_question', {
                language,
              })}
              value={values.questions[key(language)] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onQuestionChange(language, e.target.value)
              }
              onBlur={() => onSave(language)}
            />
            <RichTextEditor
              editorState={
                values.answerStates[key(language)] ?? EditorState.createEmpty()
              }
              onEditorStateChange={(state) =>
                onAnswerStateChange(language, state)
              }
              onBlur={() => onSave(language)}
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

const TranslateForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { eventId, placeId } = router.query;
  const scope = eventId ? OfferTypes.EVENTS : OfferTypes.PLACES;
  const id = scope === OfferTypes.EVENTS ? eventId : placeId;

  const [tab, setTab] = useState<string>(TranslateTabs.TITLE);
  const [isEditingOriginalTitle, setIsEditingOriginalTitle] = useState(false);
  const [isEditingOriginalDescription, setIsEditingOriginalDescription] =
    useState(false);
  const [editingOriginalFaqs, setEditingOriginalFaqs] = useState<Set<number>>(
    new Set(),
  );

  const [titleValues, setTitleValues] = useState<Record<string, string>>({});
  const [descriptionEditorStates, setDescriptionEditorStates] = useState<
    Record<string, EditorState>
  >({});
  const [faqQuestionValues, setFaqQuestionValues] = useState<
    Record<string, string>
  >({});
  const [faqAnswerEditorStates, setFaqAnswerEditorStates] = useState<
    Record<string, EditorState>
  >({});

  const toast = useToast({
    messages: {
      ...Object.fromEntries(
        languageOptions.flatMap((lang) => [
          [`title_${lang}`, t('translate.success.title', { language: lang })],
          [
            `description_${lang}`,
            t('translate.success.description', { language: lang }),
          ],
        ]),
      ),
      faq: t('translate.success.faq'),
    },
  });

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: id as string, scope });
  const offer = getOfferByIdQuery.data;

  const originalLanguage = offer?.mainLanguage ?? 'nl';
  const originalTitle = offer?.name?.[originalLanguage] ?? '';

  useEffect(() => {
    if (offer?.name) setTitleValues(offer.name);

    if (offer?.description) {
      setDescriptionEditorStates(
        Object.fromEntries(
          languageOptions.map((lang) => [
            lang,
            createEditorStateFromHtml(
              sanitizeDom(
                offer.description?.[lang],
                sanitizationPresets.EVENT_DESCRIPTION,
              ),
            ),
          ]),
        ),
      );
    }

    if (offer?.faqs) {
      const questions: Record<string, string> = {};
      const states: Record<string, EditorState> = {};

      offer.faqs.forEach((faq, faqIndex) => {
        languageOptions.forEach((lang) => {
          const key = `${faqIndex}_${lang}`;
          questions[key] = faq[lang]?.question ?? '';
          states[key] = createEditorStateFromHtml(
            sanitizeDom(
              faq[lang]?.answer,
              sanitizationPresets.EVENT_DESCRIPTION,
            ),
          );
        });
      });

      setFaqQuestionValues(questions);
      setFaqAnswerEditorStates(states);
    }
  }, [offer?.name, offer?.description, offer?.faqs]);

  const invalidateOffer = () =>
    queryClient.invalidateQueries({ queryKey: [scope, { id }] });

  const changeNameMutation = useChangeOfferNameMutation();
  const changeDescriptionMutation = useChangeOfferDescriptionMutation();
  const updateFaqMutation = useUpdateOfferFaqMutation();

  const handleTitleBlur = async (language: string, value: string) => {
    const originalValue = offer?.name?.[language] ?? '';
    if (!value || value === originalValue) return;
    await changeNameMutation.mutateAsync({
      id,
      lang: language,
      name: value,
      scope,
    });
    toast.trigger(`title_${language}`);
    invalidateOffer();
  };

  const handleDescriptionBlur = async (
    language: string,
    editorState: EditorState,
  ) => {
    const plainText = getPlainText(editorState);
    const originalPlainText = getPlainText(
      createEditorStateFromHtml(offer?.description?.[language]),
    );
    if (
      !plainText ||
      plainText === originalPlainText ||
      !editorState.getLastChangeType()
    )
      return;
    await changeDescriptionMutation.mutateAsync({
      id,
      language,
      description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      scope,
    });
    toast.trigger(`description_${language}`);
    invalidateOffer();
  };

  const saveFaqTranslation = async (faqIndex: number, language: string) => {
    if (!offer?.faqs) return;

    const key = `${faqIndex}_${language}`;
    const question = faqQuestionValues[key] ?? '';
    const editorState = faqAnswerEditorStates[key] ?? EditorState.createEmpty();
    const plainText = getPlainText(editorState);

    if (!question.trim() || !plainText) return;

    const originalQuestion = offer.faqs[faqIndex]?.[language]?.question ?? '';
    const originalPlainText = getPlainText(
      createEditorStateFromHtml(offer.faqs[faqIndex]?.[language]?.answer),
    );

    if (question === originalQuestion && plainText === originalPlainText)
      return;

    const updatedFaqs = offer.faqs.map((faq, i) =>
      i !== faqIndex
        ? faq
        : {
            ...faq,
            [language]: {
              question,
              answer: draftToHtml(
                convertToRaw(editorState.getCurrentContent()),
              ),
            },
          },
    );

    await updateFaqMutation.mutateAsync({ id, scope, faq: updatedFaqs });
    queryClient.setQueryData([scope, { id }], (old: any) => ({
      ...old,
      faqs: updatedFaqs,
    }));
    toast.trigger('faq');
  };

  const translationLanguages = languageOptions.filter(
    (lang) => lang !== originalLanguage,
  );

  const hasDescription = !!offer?.description;
  const hasFaqs = !!offer?.faqs?.length;
  const hasTitleContent = translationLanguages.some(
    (lang) => !!offer?.name?.[lang]?.trim(),
  );
  const hasDescriptionContent = translationLanguages.some(
    (lang) => !!offer?.description?.[lang],
  );
  const hasFaqContent =
    offer?.faqs?.some((faq) =>
      translationLanguages.some(
        (lang) => !!faq[lang]?.question?.trim() || !!faq[lang]?.answer,
      ),
    ) ?? false;

  return (
    <Page>
      <Page.Title>
        {originalTitle
          ? `${originalTitle} ${t('translate.title')}`
          : t('translate.title')}
      </Page.Title>
      <Page.Content>
        {toast.component}
        <Tabs
          activeKey={tab}
          onSelect={(key) => setTab(key)}
          variant={TabsVariants.FLOATING}
        >
          <Tabs.Tab
            eventKey={TranslateTabs.TITLE}
            title={
              <TabTitle
                label={t('translate.title_label')}
                hasFilled={hasTitleContent}
              />
            }
          >
            <ContentPanel>
              {languageOptions.map((language) => (
                <Box key={`translate-title-${language}`}>
                  <TitleField
                    language={language}
                    originalLanguage={originalLanguage}
                    isEditingOriginal={isEditingOriginalTitle}
                    onStartEditing={() => setIsEditingOriginalTitle(true)}
                    value={titleValues[language] || ''}
                    onChange={(value) =>
                      setTitleValues((prev) => ({ ...prev, [language]: value }))
                    }
                    onBlur={(value) => handleTitleBlur(language, value)}
                  />
                </Box>
              ))}
            </ContentPanel>
          </Tabs.Tab>
          {hasDescription && (
            <Tabs.Tab
              eventKey={TranslateTabs.DESCRIPTION}
              title={
                <TabTitle
                  label={t('translate.description_label')}
                  hasFilled={hasDescriptionContent}
                />
              }
            >
              <ContentPanel>
                {languageOptions.map((language) => (
                  <Box key={`translate-description-${language}`}>
                    <DescriptionField
                      language={language}
                      originalLanguage={originalLanguage}
                      isEditingOriginal={isEditingOriginalDescription}
                      onStartEditing={() =>
                        setIsEditingOriginalDescription(true)
                      }
                      description={offer?.description?.[language] ?? ''}
                      editorState={
                        descriptionEditorStates[language] ||
                        EditorState.createEmpty()
                      }
                      onEditorStateChange={(editorState) =>
                        setDescriptionEditorStates((prev) => ({
                          ...prev,
                          [language]: editorState,
                        }))
                      }
                      onBlur={() => {
                        const editorState = descriptionEditorStates[language];
                        if (editorState)
                          handleDescriptionBlur(language, editorState);
                      }}
                    />
                  </Box>
                ))}
              </ContentPanel>
            </Tabs.Tab>
          )}
          {hasFaqs && (
            <Tabs.Tab
              eventKey={TranslateTabs.FAQ}
              title={
                <TabTitle
                  label={t('translate.faq.label')}
                  hasFilled={hasFaqContent}
                />
              }
            >
              <ContentPanel>
                {offer?.faqs?.map((faqItem, faqIndex) => (
                  <Box key={`faq-${faqIndex}`}>
                    <FaqField
                      faqIndex={faqIndex}
                      originalLanguage={originalLanguage}
                      translationLanguages={translationLanguages}
                      faqItem={faqItem}
                      isEditingOriginal={editingOriginalFaqs.has(faqIndex)}
                      onStartEditing={() =>
                        setEditingOriginalFaqs(
                          (prev) => new Set([...prev, faqIndex]),
                        )
                      }
                      values={{
                        questions: faqQuestionValues,
                        answerStates: faqAnswerEditorStates,
                      }}
                      onQuestionChange={(lang, value) =>
                        setFaqQuestionValues((prev) => ({
                          ...prev,
                          [`${faqIndex}_${lang}`]: value,
                        }))
                      }
                      onAnswerStateChange={(lang, state) =>
                        setFaqAnswerEditorStates((prev) => ({
                          ...prev,
                          [`${faqIndex}_${lang}`]: state,
                        }))
                      }
                      onSave={(lang) => saveFaqTranslation(faqIndex, lang)}
                    />
                  </Box>
                ))}
              </ContentPanel>
            </Tabs.Tab>
          )}
        </Tabs>
        <Inline marginTop={4}>
          <Button
            variant={ButtonVariants.SUCCESS}
            onClick={() =>
              router.push(
                scope === OfferTypes.EVENTS ? `/events/${id}` : `/places/${id}`,
              )
            }
          >
            {t('translate.done')}
          </Button>
        </Inline>
      </Page.Content>
    </Page>
  );
};

export { TranslateForm };
