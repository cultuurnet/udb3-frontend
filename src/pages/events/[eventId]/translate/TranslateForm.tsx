import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useChangeNameMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { useChangeDescriptionMutation } from '@/hooks/api/offers';
import { SupportedLanguages } from '@/i18n/index';
import { useToast } from '@/pages/manage/movies/useToast';
import RichTextEditor from '@/pages/RichTextEditor';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Link, LinkVariants } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { Toast } from '@/ui/Toast';

const htmlToDraft =
  typeof window === 'object' && require('html-to-draftjs').default;

const languageOptions = [...Object.values(SupportedLanguages), 'en'];
const getGlobalValue = getValueFromTheme('global');

const TranslateForm = () => {
  const { t } = useTranslation();
  const successMessages = Object.fromEntries([
    ...languageOptions.map((lang) => [
      `title_${lang}`,
      t('translate.success.title', { language: lang }),
    ]),
    ...languageOptions.map((lang) => [
      `description_${lang}`,
      t('translate.success.description', { language: lang }),
    ]),
  ]);

  const toastConfiguration = {
    messages: successMessages,
  };
  const toast = useToast(toastConfiguration);
  const router = useRouter();
  const { eventId } = router.query;

  const [isEditingOriginalTitle, setIsEditingOriginalTitle] = useState(false);
  const [isEditingOriginalDescription, setIsEditingOriginalDescription] =
    useState(false);
  const [titleValues, setTitleValues] = useState<Record<string, string>>({});

  const [descriptionEditorStates, setDescriptionEditorStates] = useState<
    Record<string, EditorState>
  >({});

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId as string });
  const event = getEventByIdQuery.data;

  const originalTitle = useMemo(() => {
    const mainLanguage = event?.mainLanguage || 'nl';
    return event?.name ? event.name[mainLanguage] || '' : '';
  }, [event?.name, event?.mainLanguage]);

  const originalLanguage = useMemo(() => {
    return event?.mainLanguage || 'nl';
  }, [event?.mainLanguage]);

  useEffect(() => {
    if (event?.name) {
      setTitleValues(event.name);
    }

    if (event?.description) {
      const newEditorStates: Record<string, EditorState> = {};

      languageOptions.forEach((langValue) => {
        const description = event.description?.[langValue];

        if (description) {
          const draftState = htmlToDraft(description);
          const contentState = ContentState.createFromBlockArray(
            draftState.contentBlocks,
            draftState.entityMap,
          );
          newEditorStates[langValue] =
            EditorState.createWithContent(contentState);
        } else {
          newEditorStates[langValue] = EditorState.createEmpty();
        }
      });

      setDescriptionEditorStates(newEditorStates);
    }
  }, [event?.name, event?.description]);
  const onNameSuccess = (_, variables: { lang: string }) => {
    const language = variables.lang;
    toast.trigger(`title_${language}`);
  };

  const onDescriptionSuccess = (_, variables: { language: string }) => {
    const language = variables.language;
    toast.trigger(`description_${language}`);
  };

  const changeNameMutation = useChangeNameMutation({
    onSuccess: onNameSuccess,
  });

  const changeDescriptionMutation = useChangeDescriptionMutation({
    onSuccess: onDescriptionSuccess,
  });

  const handleTitleChange = (language: string, value: string) => {
    setTitleValues((prev) => ({
      ...prev,
      [language]: value,
    }));
  };

  const handleTitleBlur = async (language: string, value: string) => {
    const originalValue = event?.name?.[language] || '';
    if (value === originalValue) {
      return;
    }

    changeNameMutation.mutateAsync({
      id: eventId as string,
      lang: language,
      name: value,
      scope: 'event',
    });
  };

  const handleDescriptionChange = (
    language: string,
    editorState: EditorState,
  ) => {
    setDescriptionEditorStates((prev) => ({
      ...prev,
      [language]: editorState,
    }));
  };

  const handleDescriptionBlur = async (
    language: string,
    editorState: EditorState,
  ) => {
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText().trim();

    const originalDescription = event?.description?.[language];
    let originalPlainText = '';

    if (originalDescription) {
      const originalDraftState = htmlToDraft(originalDescription);
      const originalContentState = ContentState.createFromBlockArray(
        originalDraftState.contentBlocks,
        originalDraftState.entityMap,
      );
      originalPlainText = originalContentState.getPlainText().trim();
    }

    if (plainText === originalPlainText) {
      return;
    }

    if (!editorState.getLastChangeType()) {
      return;
    }

    const htmlDescription =
      plainText.length > 0
        ? draftToHtml(convertToRaw(editorState.getCurrentContent()))
        : '';

    if (htmlDescription.length === 0) {
      return;
    }

    changeDescriptionMutation.mutateAsync({
      id: eventId as string,
      language,
      description: htmlDescription,
      scope: 'event',
    });
  };

  const toggleEditOriginalTitle = () => {
    setIsEditingOriginalTitle(true);
  };

  const toggleEditOriginalDescription = () => {
    setIsEditingOriginalDescription(true);
  };

  return (
    <Page>
      <Page.Title>{originalTitle + ' ' + t('translate.title')}</Page.Title>
      <Page.Content>
        <Toast
          variant="success"
          body={toast.message}
          visible={!!toast.message}
          onClose={() => toast.clear()}
        />
        <Stack
          backgroundColor="white"
          padding={4}
          spacing={5}
          borderRadius={getGlobalBorderRadius}
          css={`
            box-shadow: ${getGlobalValue('boxShadow.medium')};
          `}
        >
          <Stack
            display="grid"
            css={`
              grid-template-columns: 150px 1fr;
              gap: 28px;
            `}
          >
            <Title>{t('translate.title_label')}</Title>
            <Stack spacing={4}>
              {languageOptions.map((language) => (
                <Stack
                  key={`translate-title-${language}`}
                  display="grid"
                  alignItems="center"
                  css={`
                    grid-template-columns: 120px 1fr;
                    gap: 28px;
                  `}
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
                        onClick={toggleEditOriginalTitle}
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
                          placeholder={t('translate.placeholder_title', {
                            language,
                          })}
                          value={titleValues[language] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleTitleChange(language, e.target.value)
                          }
                          onBlur={(e) =>
                            handleTitleBlur(language, e.target.value)
                          }
                        />
                      }
                    />
                  )}
                </Stack>
              ))}
            </Stack>

            <Title>{t('translate.description_label')}</Title>
            <Stack spacing={4}>
              {languageOptions.map((language) => (
                <Stack
                  key={`translate-description-${language}`}
                  display="grid"
                  css={`
                    grid-template-columns: 120px 1fr;
                    gap: 28px;
                  `}
                >
                  <Text variant="muted">
                    {originalLanguage === language
                      ? t('translate.original_label', { language })
                      : t('translate.translation_label', { language })}
                  </Text>
                  {originalLanguage === language &&
                  !isEditingOriginalDescription ? (
                    <Inline>
                      <Text variant="muted">
                        {descriptionEditorStates[language]
                          ? descriptionEditorStates[language]
                              .getCurrentContent()
                              .getPlainText()
                          : ''}
                      </Text>
                      <Button
                        variant={ButtonVariants.LINK}
                        onClick={toggleEditOriginalDescription}
                      >
                        {t('translate.change')}
                      </Button>
                    </Inline>
                  ) : (
                    <FormElement
                      id={`create-description-${language}`}
                      Component={
                        <RichTextEditor
                          editorState={
                            descriptionEditorStates[language] ||
                            EditorState.createEmpty()
                          }
                          onEditorStateChange={(editorState) =>
                            handleDescriptionChange(language, editorState)
                          }
                          onBlur={() => {
                            const editorState =
                              descriptionEditorStates[language];
                            if (editorState) {
                              handleDescriptionBlur(language, editorState);
                            }
                          }}
                        />
                      }
                    />
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>

        <Inline>
          <Link
            href={`/event/${eventId}/preview`}
            variant={LinkVariants.BUTTON_SUCCESS}
          >
            <Text>{t('translate.done')}</Text>
          </Link>
        </Inline>
      </Page.Content>
    </Page>
  );
};
export { TranslateForm };
