import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Scope, ScopeTypes } from '@/constants/OfferType';
import {
  useDeleteOrganizerEducationalDescriptionMutation,
  useUpdateOrganizerEducationalDescriptionMutation,
} from '@/hooks/api/organizers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import RichTextEditor from '@/pages/RichTextEditor';
import { Event } from '@/types/Event';
import { Organizer } from '@/types/Organizer';
import { Alert } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { ProgressBar, ProgressBarVariants } from '@/ui/ProgressBar';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { Breakpoints } from '@/ui/theme';

import { TabContentProps, ValidationStatus } from './AdditionalInformationStep';

const htmlToDraft =
  typeof window === 'object' && require('html-to-draftjs').default;

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
    Math.round((description?.length / IDEAL_DESCRIPTION_LENGTH) * 100),
    100,
  );

  return (
    <Stack spacing={3} alignItems="flex-start" {...getStackProps(props)}>
      {description?.length < IDEAL_DESCRIPTION_LENGTH && (
        <ProgressBar
          variant={ProgressBarVariants.SUCCESS}
          progress={descriptionProgress}
        />
      )}
      <Text variant={TextVariants.MUTED}>
        {t(
          description?.length < IDEAL_DESCRIPTION_LENGTH
            ? 'create.additionalInformation.description.progress_info.not_complete'
            : 'create.additionalInformation.description.progress_info.complete',
          {
            idealLength: IDEAL_DESCRIPTION_LENGTH,
            count: IDEAL_DESCRIPTION_LENGTH - description?.length,
          },
        )}
      </Text>
      <Button variant={ButtonVariants.LINK} onClick={onClear}>
        {t('create.additionalInformation.description.clear')}
      </Button>
    </Stack>
  );
};

const DescriptionTips = ({
  scope,
  eventTypeId,
}: {
  scope: Scope;
  eventTypeId: string;
}) => {
  const { t, i18n } = useTranslation();

  return (
    (eventTypeId || scope === ScopeTypes.ORGANIZERS) && (
      <Alert
        css={`
          margin-top: 1.86rem;
        `}
      >
        {t('create.additionalInformation.cultuurkuur.tip')}
      </Alert>
    )
  );
};

type CultuurKuurStepProps = StackProps & TabContentProps;

const CultuurKuurStep = ({
  scope,
  field,
  offerId,
  onSuccessfulChange,
  onValidationChange,
  ...props
}: CultuurKuurStepProps) => {
  const { t, i18n } = useTranslation();

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const plainTextDescription = useMemo(
    () => editorState.getCurrentContent().getPlainText(),
    [editorState],
  );

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });

  // @ts-expect-error
  const entity: Event | Place | Organizer | undefined = getEntityByIdQuery.data;

  useEffect(() => {
    const newDescription = entity?.educationalDescription?.[i18n.language];
    if (!newDescription) return;

    const draftState = htmlToDraft(newDescription);
    const contentState = ContentState.createFromBlockArray(
      draftState.contentBlocks,
      draftState.entityMap,
    );

    setEditorState(EditorState.createWithContent(contentState));

    const plainText = contentState.getPlainText() ?? '';
    const isCompleted = plainText.length >= IDEAL_DESCRIPTION_LENGTH;

    onValidationChange(
      isCompleted ? ValidationStatus.SUCCESS : ValidationStatus.NONE,
      field,
    );
  }, [
    field,
    entity?.educationalDescription,
    entity?.mainLanguage,
    i18n.language,
    onValidationChange,
  ]);

  const eventTypeId = useMemo(() => {
    return entity?.terms?.find((term) => term.domain === 'eventtype')?.id!;
  }, [entity?.terms]);

  const changeDescriptionMutation =
    useUpdateOrganizerEducationalDescriptionMutation({
      onSuccess: onSuccessfulChange,
    });

  const deleteDescriptionMutation =
    useDeleteOrganizerEducationalDescriptionMutation({
      onSuccess: onSuccessfulChange,
    });

  const handleBlur = () => {
    const isCompleted = plainTextDescription.length >= IDEAL_DESCRIPTION_LENGTH;

    onValidationChange(
      isCompleted ? ValidationStatus.SUCCESS : ValidationStatus.NONE,
      field,
    );

    if (!editorState.getLastChangeType()) {
      return;
    }

    changeDescriptionMutation.mutate({
      educationalDescription:
        plainTextDescription.length > 0
          ? draftToHtml(convertToRaw(editorState.getCurrentContent()))
          : '',
      mainLanguage: i18n.language,
      organizerId: offerId,
    });
  };

  const handleClear = () => {
    setEditorState(EditorState.createEmpty());

    deleteDescriptionMutation.mutate({
      mainLanguage: i18n.language,
      organizerId: offerId,
    });
  };

  return (
    <Inline
      stackOn={Breakpoints.L}
      css={`
        gap: 2rem;
      `}
    >
      <FormElement
        flex="1 0 50%"
        id="create-description"
        label={t('create.additionalInformation.description.title')}
        Component={
          <RichTextEditor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            onBlur={handleBlur}
          />
        }
        info={
          <DescriptionInfo
            description={plainTextDescription}
            onClear={handleClear}
            eventTypeId={eventTypeId}
          />
        }
        {...getStackProps(props)}
      />
      <DescriptionTips scope={scope} eventTypeId={eventTypeId} />
    </Inline>
  );
};

export { CultuurKuurStep };
