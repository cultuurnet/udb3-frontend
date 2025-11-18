import { EditorState } from 'draft-js';
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
import { Toast } from '@/ui/Toast';

const TranslateForm = () => {
  const { t } = useTranslation();
  const toastConfiguration = {
    messages: {
      translation_nl: 'Titel succesvol bijgewerkt (Nederlands).',
      translation_fr: 'Titre mis à jour avec succès (Français).',
      translation_de: 'Titel erfolgreich aktualisiert (Deutsch).',
    },
  };
  const toast = useToast(toastConfiguration);
  const router = useRouter();
  const { eventId } = router.query;

  const [titleValues, setTitleValues] = useState<Record<string, string>>({});

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const plainTextDescription = useMemo(
    () => editorState.getCurrentContent().getPlainText(),
    [editorState],
  );

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId as string });
  const event = getEventByIdQuery.data;

  useEffect(() => {
    if (event?.name) {
      setTitleValues(event.name);
    }
  }, [event?.name]);

  const onNameSuccess = (_, variables: { lang: string }) => {
    const language = variables.lang;
    toast.trigger(`translation_${language}`);
  };

  const onDescriptionSuccess = () => {
    console.log('Description changed successfully');
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
    // Check if the value actually changed
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

  return (
    <Page>
      <Page.Title>Vertaal</Page.Title>
      <Page.Content>
        <Toast
          variant="success"
          body={toast.message}
          visible={!!toast.message}
          onClose={() => toast.clear()}
        />
        <Stack backgroundColor="white" padding={4} spacing={4}>
          <Inline>
            <p>
              <strong>Titel:</strong>
            </p>
          </Inline>

          {Object.entries(SupportedLanguages).map(([langKey, langValue]) => (
            <Inline key={langKey}>
              <FormElement
                id={`translate-title-${langValue}`}
                label={`Titel in ${langValue}`}
                Component={
                  <Input
                    placeholder={`Voer titel in ${langValue} in`}
                    value={titleValues[langValue] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleTitleChange(langValue, e.target.value)
                    }
                    onBlur={(e) => handleTitleBlur(langValue, e.target.value)}
                  />
                }
              />
            </Inline>
          ))}

          <Inline>
            <p>Omschrijving</p>
          </Inline>

          {Object.entries(SupportedLanguages).map(([lang]) => (
            <Inline key={lang}>
              <FormElement
                flex="1 0 50%"
                id={`create-description-${lang}`}
                label={`Beschrijving in ${lang}`}
                Component={
                  <RichTextEditor
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    onBlur={() => {}}
                  />
                }
              />
            </Inline>
          ))}
        </Stack>

        <Inline>
          <Button variant="success">Klaar met vertalen</Button>
        </Inline>
      </Page.Content>
    </Page>
  );
};
export { TranslateForm };
