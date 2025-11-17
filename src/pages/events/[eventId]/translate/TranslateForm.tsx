import { useRouter } from 'next/router';

import {
  useChangeNameMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { useChangeDescriptionMutation } from '@/hooks/api/offers';
import { SupportedLanguages } from '@/i18n/index';
import { Button } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';

const TranslateForm = () => {
  // Get event data here
  const router = useRouter();
  const { eventId } = router.query;

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId as string });

  const event = getEventByIdQuery.data;

  console.log('Event to translate:', event);

  const onDescriptionSuccess = () => {
    console.log('Description changed successfully');
  };

  const onNameSuccess = () => {
    console.log('Name changed successfully');
  };

  const changeDescriptionMutation = useChangeDescriptionMutation({
    onSuccess: onDescriptionSuccess,
  });

  const changeNameMutation = useChangeNameMutation({
    onSuccess: onNameSuccess,
  });

  return (
    <Page>
      <Page.Title>Vertaal</Page.Title>
      <Page.Content>
        <Stack backgroundColor="white" padding={4} spacing={4}>
          <Inline>
            <p>
              <strong>Titel:</strong> Hello world
            </p>
          </Inline>
          <Inline>
            {Object.entries(SupportedLanguages).map(([lang]) => (
              <input
                disabled={lang.toLowerCase() === event.mainLanguage}
                key={lang}
                placeholder={`Title in ${lang}`}
              />
            ))}
          </Inline>
          <Inline>
            <p>Omschrijving</p>
          </Inline>
          <Inline>
            {Object.entries(SupportedLanguages).map(([lang]) => (
              <input
                disabled={lang.toLowerCase() === event.mainLanguage}
                key={lang}
                placeholder={`Description in ${lang}`}
              />
            ))}
          </Inline>
        </Stack>
        <Inline>
          <Button variant="success">Klaar met vertalen</Button>
        </Inline>
      </Page.Content>
    </Page>
  );
};

export { TranslateForm };
