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
} from '@/hooks/api/offers';
import { SupportedLanguages } from '@/i18n/index';
import { useToast } from '@/pages/manage/movies/useToast';
import RichTextEditor from '@/pages/RichTextEditor';
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
} as const;

type TabTitleProps = {
  label: string;
  hasFilled: boolean;
};

const TabTitle = ({ label, hasFilled }: TabTitleProps) => (
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
  const [titleValues, setTitleValues] = useState<Record<string, string>>({});

  const [descriptionEditorStates, setDescriptionEditorStates] = useState<
    Record<string, EditorState>
  >({});

  const toast = useToast({
    messages: Object.fromEntries([
      ...languageOptions.map((lang) => [
        `title_${lang}`,
        t('translate.success.title', { language: lang }),
      ]),
      ...languageOptions.map((lang) => [
        `description_${lang}`,
        t('translate.success.description', { language: lang }),
      ]),
    ]),
  });

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: id as string, scope });
  const offer = getOfferByIdQuery.data;

  const originalLanguage = offer?.mainLanguage || 'nl';
  const originalTitle = offer?.name?.[originalLanguage] || '';

  useEffect(() => {
    if (offer?.name) {
      setTitleValues(offer.name);
    }

    if (offer?.description) {
      const newEditorStates: Record<string, EditorState> = {};

      languageOptions.forEach((lang) => {
        const description = sanitizeDom(
          offer.description?.[lang],
          sanitizationPresets.EVENT_DESCRIPTION,
        );

        if (description) {
          const draftState = htmlToDraft(description);
          const contentState = ContentState.createFromBlockArray(
            draftState.contentBlocks,
            draftState.entityMap,
          );
          newEditorStates[lang] = EditorState.createWithContent(contentState);
        } else {
          newEditorStates[lang] = EditorState.createEmpty();
        }
      });

      setDescriptionEditorStates(newEditorStates);
    }
  }, [offer?.name, offer?.description]);

  const invalidateOffer = () =>
    queryClient.invalidateQueries({ queryKey: [scope, { id }] });

  const changeNameMutation = useChangeOfferNameMutation();
  const changeDescriptionMutation = useChangeOfferDescriptionMutation();

  const handleTitleBlur = async (language: string, value: string) => {
    const originalValue = offer?.name?.[language] || '';

    if (value === '' || value === originalValue) return;

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
    const plainText = editorState.getCurrentContent().getPlainText().trim();

    const originalDescription = offer?.description?.[language];
    let originalPlainText = '';

    if (originalDescription) {
      const draftState = htmlToDraft(originalDescription);
      const contentState = ContentState.createFromBlockArray(
        draftState.contentBlocks,
        draftState.entityMap,
      );
      originalPlainText = contentState.getPlainText().trim();
    }

    if (
      plainText.length === 0 ||
      plainText === originalPlainText ||
      !editorState.getLastChangeType()
    ) {
      return;
    }

    await changeDescriptionMutation.mutateAsync({
      id,
      language,
      description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      scope,
    });
    toast.trigger(`description_${language}`);
    invalidateOffer();
  };

  const translationLanguages = languageOptions.filter(
    (lang) => lang !== originalLanguage,
  );

  const hasDescription = !!offer?.description;
  const hasTitleContent = translationLanguages.some(
    (lang) => !!offer?.name?.[lang]?.trim(),
  );
  const hasDescriptionContent = translationLanguages.some(
    (lang) => !!offer?.description?.[lang],
  );

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
          <Text variant="muted">{titleValues[language] || ''}</Text>
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
              value={titleValues[language] || ''}
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
              description={
                descriptionEditorStates[language]
                  ? draftToHtml(
                      convertToRaw(
                        descriptionEditorStates[language].getCurrentContent(),
                      ),
                    )
                  : ''
              }
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
        <div id={`description-editor-container-${language}`}>
          <FormElement
            id={`create-description-${language}`}
            Component={
              <RichTextEditor
                editorState={
                  descriptionEditorStates[language] || EditorState.createEmpty()
                }
                onEditorStateChange={(editorState) =>
                  setDescriptionEditorStates((prev) => ({
                    ...prev,
                    [language]: editorState,
                  }))
                }
                onBlur={() => {
                  const editorState = descriptionEditorStates[language];
                  if (editorState) handleDescriptionBlur(language, editorState);
                }}
              />
            }
          />
        </div>
      )}
    </Stack>
  ));

  return (
    <Page>
      <Page.Title>{`${originalTitle} ${t('translate.title')}`}</Page.Title>
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
        </Tabs>
        <Inline marginTop={4}>
          <Button
            variant={ButtonVariants.SUCCESS}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              router.push(
                scope === OfferTypes.EVENTS ? `/events/${id}` : `/places/${id}`,
              );
            }}
          >
            {t('translate.done')}
          </Button>
        </Inline>
      </Page.Content>
    </Page>
  );
};
export { TranslateForm };
