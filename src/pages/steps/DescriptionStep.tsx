import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useChangeDescriptionMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { Event } from '@/types/Event';
import { Alert } from '@/ui/Alert';
import { Box, parseSpacing } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { ProgressBar, ProgressBarVariants } from '@/ui/ProgressBar';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { TextArea } from '@/ui/TextArea';

const IDEAL_DESCRIPTION_LENGTH = 200;

type DescriptionInfoProps = StackProps & {
  description: string;
  eventTypeId: string;
  onClear: () => void;
};

const DescriptionInfo = ({
  description,
  eventTypeId,
  onClear,
  ...props
}: DescriptionInfoProps) => {
  const { t } = useTranslation();

  const descriptionProgress = Math.min(
    Math.round((description.length / IDEAL_DESCRIPTION_LENGTH) * 100),
    100,
  );

  return (
    <Stack spacing={3} alignItems="flex-start" {...getStackProps(props)}>
      {description.length < IDEAL_DESCRIPTION_LENGTH && (
        <ProgressBar
          variant={ProgressBarVariants.SUCCESS}
          progress={descriptionProgress}
        />
      )}
      <Text variant={TextVariants.MUTED}>
        {description.length < IDEAL_DESCRIPTION_LENGTH
          ? t(
              'create.additionalInformation.description.progress_info.not_complete',
              {
                idealLength: IDEAL_DESCRIPTION_LENGTH,
                count: IDEAL_DESCRIPTION_LENGTH - description.length,
              },
            )
          : t(
              'create.additionalInformation.description.progress_info.complete',
              {
                idealLength: IDEAL_DESCRIPTION_LENGTH,
              },
            )}
      </Text>
      <Button variant={ButtonVariants.LINK} onClick={onClear}>
        {t('create.additionalInformation.description.clear')}
      </Button>
      {eventTypeId && (
        <Alert>
          <Box
            forwardedAs="div"
            dangerouslySetInnerHTML={{
              __html: t(
                `create*additionalInformation*description*tips*${eventTypeId}`,
                {
                  keySeparator: '*',
                },
              ),
            }}
            css={`
              strong {
                font-weight: bold;
              }

              ul {
                list-style-type: disc;
                margin-bottom: ${parseSpacing(4)};

                li {
                  margin-left: ${parseSpacing(5)};
                }
              }
            `}
          />
        </Alert>
      )}
    </Stack>
  );
};

type DescriptionStepProps = StackProps & {
  eventId?: string;
  onChangeCompleted: (completed: boolean) => void;
  onSuccessfulChange: () => void;
};

const DescriptionStep = ({
  eventId,
  onSuccessfulChange,
  onChangeCompleted,
  ...props
}: DescriptionStepProps) => {
  const { t, i18n } = useTranslation();

  const [description, setDescription] = useState('');

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId });

  // @ts-expect-error
  const event: Event | undefined = getEventByIdQuery.data;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChangeCompleted = useCallback(onChangeCompleted, []);

  useEffect(() => {
    if (!event?.description) return;

    const newDescription =
      event.description[i18n.language] ?? event.description[event.mainLanguage];

    setDescription(newDescription);

    const isCompleted = newDescription.length >= IDEAL_DESCRIPTION_LENGTH;

    handleChangeCompleted(isCompleted);
  }, [
    event?.description,
    event?.mainLanguage,
    i18n.language,
    handleChangeCompleted,
  ]);

  const eventTypeId = useMemo(() => {
    return event?.terms.find((term) => term.domain === 'eventtype')?.id!;
  }, [event?.terms]);

  const changeDescriptionMutation = useChangeDescriptionMutation({
    onSuccess: onSuccessfulChange,
  });

  const handleBlur = () => {
    if (!description) return;

    const isCompleted = description.length >= IDEAL_DESCRIPTION_LENGTH;

    onChangeCompleted(isCompleted);

    changeDescriptionMutation.mutate({
      description,
      language: i18n.language,
      eventId,
    });
  };

  const handleClear = () => {
    setDescription('');

    changeDescriptionMutation.mutate({
      description: '',
      language: i18n.language,
      eventId,
    });
  };

  const handleInput = (e) => {
    setDescription(e.target.value);
  };

  return (
    <FormElement
      id="create-description"
      label={t('create.additionalInformation.description.title')}
      Component={
        <TextArea
          rows={5}
          value={description}
          onInput={handleInput}
          onBlur={handleBlur}
        />
      }
      info={
        <DescriptionInfo
          description={description}
          onClear={handleClear}
          eventTypeId={eventTypeId}
        />
      }
      {...getStackProps(props)}
    />
  );
};

export { DescriptionStep };
