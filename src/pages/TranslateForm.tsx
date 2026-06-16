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
import { SupportedLanguages } from '@/i18n/index';
import { useToast } from '@/pages/manage/movies/useToast';
import RichTextEditor from '@/pages/RichTextEditor';
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
import { Toast } from '@/ui/Toast';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

import { DescriptionPreview } from './preview/DescriptionPreview';

const htmlToDraft =
  typeof window === 'object' && require('html-to-draftjs').default;

const languageOptions = [...Object.values(SupportedLanguages), 'en'];
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

const createEditorStateFromHtml = (html: string | undefined) => {
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

const TabTitle = ({
  label,
  hasFilled,
}: {
  label: string;
  hasFilled: boolean;
}) => (
  <Inline spacing={3}>
    {hasFilled && (
      <Icon name={Icons.CHECK_CIRCLE} color={getGlobalValue('successColor')} />
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
    toast.trigger('faq');
    invalidateOffer();
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

  const titleFields = languageOptions.map((language) => (
    <Stack
      key={`translate-title-${language}`}
      display="grid"
      alignItems="center"
      css={rowGridCss}
    >
      <Text variant="muted">
        {originalLanguage === language
          ? t('translate.original_label', { language })
          : t('translate.translation_label', { language })}
      </Text>
      {originalLanguage === language && !isEditingOriginalTitle ? (
        <Inline spacing={3}>
          <Text variant="muted">{titleValues[language] ?? ''}</Text>
          <Button
            onClick={() => setIsEditingOriginalTitle(true)}
            variant={ButtonVariants.LINK}
          >
            {t('translate.change')}
          </Button>
        </Inline>
      ) : (
        <FormElement
          id={`translate-title-${language}`}
          Component={
            <Input
              maxWidth={300}
              placeholder={t('translate.placeholder_title', { language })}
              value={titleValues[language] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitleValues((prev) => ({
                  ...prev,
                  [language]: e.target.value,
                }))
              }
              onBlur={(e) => handleTitleBlur(language, e.target.value)}
            />
          }
        />
      )}
    </Stack>
  ));

  const descriptionFields = languageOptions.map((language) => (
    <Stack
      key={`translate-description-${language}`}
      id={`description-container-${language}`}
      display="grid"
      css={rowGridCss}
    >
      <Text variant="muted">
        {originalLanguage === language
          ? t('translate.original_label', { language })
          : t('translate.translation_label', { language })}
      </Text>
      {originalLanguage === language && !isEditingOriginalDescription ? (
        <Stack spacing={3}>
          <Panel padding={3} color={getTextValue('muted.color')}>
            <DescriptionPreview
              description={offer?.description?.[language] ?? ''}
            />
          </Panel>
          <Button
            variant={ButtonVariants.LINK}
            onClick={() => setIsEditingOriginalDescription(true)}
          >
            {t('translate.change')}
          </Button>
        </Stack>
      ) : (
        <FormElement
          id={`create-description-${language}`}
          Component={
            <RichTextEditor
              editorState={
                descriptionEditorStates[language] ?? EditorState.createEmpty()
              }
              onEditorStateChange={(editorState) =>
                setDescriptionEditorStates((prev) => ({
                  ...prev,
                  [language]: editorState,
                }))
              }
              onBlur={() =>
                handleDescriptionBlur(
                  language,
                  descriptionEditorStates[language] ??
                    EditorState.createEmpty(),
                )
              }
            />
          }
        />
      )}
    </Stack>
  ));

  const faqFields = offer?.faqs?.map((faq, faqIndex) => (
    <Stack key={`faq-${faqIndex}`} spacing={4} maxWidth="60rem">
      {faqIndex > 0 && <Box height="1px" backgroundColor={colors.grey3} />}
      <Text fontWeight="bold">
        {t('translate.faq.title', { index: faqIndex + 1 })}
      </Text>

      <Stack display="grid" css={rowGridCss}>
        <Text variant="muted">
          {t('translate.original_label', { language: originalLanguage })}
        </Text>
        {editingOriginalFaqs.has(faqIndex) ? (
          <Stack spacing={3}>
            <Input
              value={faqQuestionValues[`${faqIndex}_${originalLanguage}`] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFaqQuestionValues((prev) => ({
                  ...prev,
                  [`${faqIndex}_${originalLanguage}`]: e.target.value,
                }))
              }
              onBlur={() => saveFaqTranslation(faqIndex, originalLanguage)}
            />
            <RichTextEditor
              editorState={
                faqAnswerEditorStates[`${faqIndex}_${originalLanguage}`] ??
                EditorState.createEmpty()
              }
              onEditorStateChange={(editorState) =>
                setFaqAnswerEditorStates((prev) => ({
                  ...prev,
                  [`${faqIndex}_${originalLanguage}`]: editorState,
                }))
              }
              onBlur={() => saveFaqTranslation(faqIndex, originalLanguage)}
            />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Inline justifyContent="space-between">
              <Text fontWeight="bold">
                {faq[originalLanguage]?.question ?? ''}
              </Text>
              <Button
                variant={ButtonVariants.LINK}
                onClick={() =>
                  setEditingOriginalFaqs((prev) => new Set([...prev, faqIndex]))
                }
              >
                {t('translate.change')}
              </Button>
            </Inline>
            <DescriptionPreview
              description={faq[originalLanguage]?.answer ?? ''}
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
              value={faqQuestionValues[`${faqIndex}_${language}`] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFaqQuestionValues((prev) => ({
                  ...prev,
                  [`${faqIndex}_${language}`]: e.target.value,
                }))
              }
              onBlur={() => saveFaqTranslation(faqIndex, language)}
            />
            <RichTextEditor
              editorState={
                faqAnswerEditorStates[`${faqIndex}_${language}`] ??
                EditorState.createEmpty()
              }
              onEditorStateChange={(editorState) =>
                setFaqAnswerEditorStates((prev) => ({
                  ...prev,
                  [`${faqIndex}_${language}`]: editorState,
                }))
              }
              onBlur={() => saveFaqTranslation(faqIndex, language)}
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ));

  return (
    <Page>
      <Page.Title>
        {originalTitle
          ? `${originalTitle} ${t('translate.title')}`
          : t('translate.title')}
      </Page.Title>
      <Page.Content>
        <Toast
          variant="success"
          body={toast.message}
          visible={!!toast.message}
          onClose={() => toast.clear()}
        />
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
            <ContentPanel>{titleFields}</ContentPanel>
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
              <ContentPanel>{descriptionFields}</ContentPanel>
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
              <ContentPanel>{faqFields}</ContentPanel>
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
