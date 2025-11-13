import { useRouter } from 'next/router';

import { useGetEventByIdQuery } from '@/hooks/api/events';
import { SupportedLanguages } from '@/i18n/index';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';

const TranslateForm = () => {
  // Get event data here
  const router = useRouter();
  const { eventId } = router.query;

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId as string });

  const event = getEventByIdQuery.data;

  console.log('Event to translate:', event);

  console.log('event name', event?.name);

  return (
    <Page>
      <Page.Title>Vertaal</Page.Title>
      <Page.Content>
        <Stack>
          {Object.entries(SupportedLanguages).map(([lang]) => (
            <input key={lang} placeholder={`Title in ${lang}`} />
          ))}
        </Stack>
      </Page.Content>
    </Page>
  );
};

export { TranslateForm };
