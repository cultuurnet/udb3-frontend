import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
} from 'draft-js';
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
import { Button } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { Toast } from '@/ui/Toast';

const languageOptions = [...Object.values(SupportedLanguages), 'en'];
const getGlobalValue = getValueFromTheme('global');

const TranslateForm = () => {
  const { t } = useTranslation();
  const toastConfiguration = {
    messages: {
      title_nl: 'Titel succesvol bijgewerkt (Nederlands).',
      title_fr: 'Titre mis à jour avec succès (Français).',
      title_de: 'Titel erfolgreich aktualisiert (Deutsch).',
      description_nl: 'Beschrijving succesvol bijgewerkt (Nederlands).',
      description_fr: 'Description mise à jour avec succès (Français).',
      description_de: 'Beschreibung erfolgreich aktualisiert (Deutsch).',
    },
  };
  const toast = useToast(toastConfiguration);
  const router = useRouter();
  const { eventId } = router.query;

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

      Object.entries(SupportedLanguages).forEach(([langKey, langValue]) => {
        const description = event.description?.[langValue];

        if (description) {
          try {
            const contentState = convertFromRaw(JSON.parse(description));
            newEditorStates[langValue] =
              EditorState.createWithContent(contentState);
          } catch {
            const contentState = ContentState.createFromText(description);
            newEditorStates[langValue] =
              EditorState.createWithContent(contentState);
          }
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
    const rawContent = convertToRaw(contentState);
    const newDescription = JSON.stringify(rawContent);

    const originalDescription = event?.description?.[language];

    let originalDescriptionFormatted = '';
    if (originalDescription) {
      try {
        JSON.parse(originalDescription);
        originalDescriptionFormatted = originalDescription;
      } catch {
        const originalContentState =
          ContentState.createFromText(originalDescription);
        originalDescriptionFormatted = JSON.stringify(
          convertToRaw(originalContentState),
        );
      }
    }

    if (newDescription === originalDescriptionFormatted) {
      return;
    }

    const plainText = contentState.getPlainText().trim();
    if (!plainText) {
      return;
    }

    changeDescriptionMutation.mutateAsync({
      id: eventId as string,
      language,
      description: newDescription,
      scope: 'event',
    });
  };

  return (
    <Page>
      <Page.Title>{originalTitle + ' vertalen'}</Page.Title>
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
            <Title>Titel</Title>
            <Stack spacing={4}>
              {languageOptions.map((language) => (
                <Stack
                  key={language}
                  display="grid"
                  alignItems="center"
                  css={`
                    grid-template-columns: 120px 1fr;
                    gap: 28px;
                  `}
                >
                  <Text variant="muted">
                    {originalLanguage === language
                      ? `Origineel ${language}`
                      : `Vertaling ${language}`}
                  </Text>
                  <FormElement
                    id={`translate-title-${language}`}
                    Component={
                      <Input
                        maxWidth={300}
                        placeholder={`Voer titel in ${language} in`}
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
                </Stack>
              ))}
            </Stack>

            <Title>Beschrijving</Title>
            <Stack spacing={4}>
              {languageOptions.map((language) => (
                <Stack
                  key={language}
                  display="grid"
                  css={`
                    grid-template-columns: 120px 1fr;
                    gap: 28px;
                  `}
                >
                  <Text variant="muted">
                    {originalLanguage === language
                      ? `Origineel ${language}`
                      : `Vertaling ${language}`}
                  </Text>
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
                          const editorState = descriptionEditorStates[language];
                          if (editorState) {
                            handleDescriptionBlur(language, editorState);
                          }
                        }}
                      />
                    }
                  />
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>

        <Inline>
          <Button variant="success">Klaar met vertalen</Button>
        </Inline>
      </Page.Content>
    </Page>
  );
};
export { TranslateForm };
