import { yupResolver } from '@hookform/resolvers/yup';
import type { DragEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useController, useForm, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useAutoFocus } from '@/hooks/useAutoFocus';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ImageIcon } from '@/pages/PictureUploadBox';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Link } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';
import { cn } from '@/ui/shadcn/utils';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { TextArea } from '@/ui/TextArea';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Tooltip } from '@/ui/Tooltip';

type FormData = {
  description: string;
  copyrightHolder: string;
  isAiGenerated?: boolean;
  file: FileList;
};

type PictureUploadModalProps = {
  visible: boolean;
  onClose: () => void;
  draggedImageFile?: FileList;
  imageToEdit?: {
    description: string;
    copyrightHolder: string;
    isAiGenerated?: boolean;
    thumbnailUrl?: string;
  };
  onSubmitValid: (data: FormData) => Promise<void>;
  loading: boolean;
};

const MAX_FILE_SIZE = 20_000_000;
const MAX_DESCRIPTION_LENGTH = 250;
const ALLOWED_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif'];

const getValue = getValueFromTheme('pictureUploadBox');

const handleClickUpload = () => {
  document.getElementById('file').click();
};

type PictureUploadBoxProps = {
  error?: string;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
};

const PictureUploadBox = ({
  error,
  onDrop,
  onDragOver,
}: PictureUploadBoxProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      flex={1}
      spacing={4}
      height={300}
      backgroundColor={getValue('backgroundColor')}
      justifyContent="center"
      alignItems="center"
      css={`
        border: 1px solid
          ${getValue(`${error ? 'errorBorderColor' : 'borderColor'}`)};
      `}
      padding={4}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <Text fontWeight={700}>{t('pictures.upload_modal.select_photo')}</Text>
      <ImageIcon width="80" />
      <Stack spacing={3} alignItems="center">
        <Text>{t('pictures.upload_modal.drag_file')}</Text>
        <Button onClick={handleClickUpload}>
          {t('pictures.upload_modal.actions.choose_file')}
        </Button>
        <Text color={colors.danger}>{error}</Text>
      </Stack>
      <Text variant={TextVariants.MUTED} textAlign="center">
        {t('pictures.upload_modal.file_requirements', {
          maxFileSize: MAX_FILE_SIZE / 1_000_000,
        })}
      </Text>
    </Stack>
  );
};

type SelectedImageProps = {
  image: File;
};

const SelectedImage = ({ image }: SelectedImageProps) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <div className="tw:relative tw:h-48 tw:min-w-0">
      {previewUrl && (
        <Image
          src={previewUrl}
          alt={image.name}
          className="tw:h-full tw:w-full tw:rounded-md tw:object-cover tw:object-center"
        />
      )}
      <div className="tw:absolute tw:top-2 tw:right-2 tw:rounded-full tw:bg-white/85">
        <Button
          variant={ButtonVariants.ICON}
          iconName={Icons.PENCIL}
          aria-label={t('pictures.upload_modal.actions.change_file')}
          title={t('pictures.upload_modal.actions.change_file')}
          onClick={handleClickUpload}
        />
      </div>
    </div>
  );
};

const TermsAndConditionsLink = () => {
  const { t, i18n } = useTranslation();

  return (
    <Link
      href={`https://www.publiq.be/${i18n.language}/gebruikersovereenkomst-uitdatabank`}
      alt={t(
        'pictures.upload_modal.disclaimer.terms_and_conditions.labels.terms',
      )}
    >
      {t('pictures.upload_modal.disclaimer.terms_and_conditions.labels.terms')}
    </Link>
  );
};

const CopyrightLink = () => {
  const { t } = useTranslation();

  return (
    <Link
      href="/copyright"
      alt={t(
        'pictures.upload_modal.disclaimer.terms_and_conditions.labels.copyright',
      )}
    >
      {t(
        'pictures.upload_modal.disclaimer.terms_and_conditions.labels.copyright',
      )}
    </Link>
  );
};

type AiGeneratedFieldProps = {
  name: string;
  value?: boolean;
  error?: string;
  onChange: (value: boolean) => void;
};

const getAiGeneratedOption = (isAiGenerated?: boolean) => {
  if (isAiGenerated === true) return 'yes';
  if (isAiGenerated === false) return 'no';
  return '';
};

const getAiLabelMessageKey = (isAiGenerated?: boolean) => {
  if (isAiGenerated === true)
    return 'pictures.upload_modal.ai_generated.label_notice';
  if (isAiGenerated === false)
    return 'pictures.upload_modal.ai_generated.label_none';
  return 'pictures.upload_modal.ai_generated.label_hint';
};

const AiGeneratedField = ({
  name,
  value,
  error,
  onChange,
}: AiGeneratedFieldProps) => {
  const { t } = useTranslation();

  const options = [
    { value: 'yes', label: t('pictures.upload_modal.ai_generated.yes') },
    { value: 'no', label: t('pictures.upload_modal.ai_generated.no') },
  ];

  return (
    <Stack spacing={3} paddingBottom={5}>
      <Text fontWeight="bold">
        {t('pictures.upload_modal.ai_generated.title')}
      </Text>
      <Text variant={TextVariants.MUTED}>
        {t('pictures.upload_modal.ai_generated.description')}
      </Text>
      <Box className="tw:grid tw:grid-cols-1 tw:gap-3 tw:sm:grid-cols-[16rem_1fr]">
        <RadioGroup
          name={name}
          value={getAiGeneratedOption(value)}
          onValueChange={(selected) => onChange(selected === 'yes')}
          aria-label={t('pictures.upload_modal.ai_generated.title')}
          className="tw:grid-rows-2 tw:gap-3"
        >
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={`${name}-${option.value}`}
              className="tw:m-0 tw:flex tw:cursor-pointer tw:items-center tw:gap-3 tw:rounded-md tw:border tw:border-input tw:px-4 tw:py-2.5 tw:has-data-[state=checked]:border-primary tw:has-data-[state=checked]:bg-info-muted"
            >
              <RadioGroupItem
                id={`${name}-${option.value}`}
                value={option.value}
              />
              <span className="tw:font-semibold">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
        <div
          className={cn(
            'tw:flex tw:items-center tw:gap-3 tw:rounded-md tw:p-2',
            value ? 'tw:bg-info-muted' : 'tw:bg-muted',
          )}
        >
          <Image
            src="/assets/ai-label-illustration.svg"
            alt=""
            className={cn(
              'tw:h-16 tw:w-24 tw:shrink-0 tw:object-contain',
              !value && 'tw:opacity-40',
            )}
          />
          <Text variant={value ? undefined : TextVariants.MUTED}>
            {t(getAiLabelMessageKey(value))}
          </Text>
        </div>
      </Box>
      {error && <Text color={colors.danger}>{error}</Text>}
    </Stack>
  );
};

const PictureUploadModal = ({
  visible,
  onClose,
  draggedImageFile,
  imageToEdit,
  onSubmitValid,
  loading,
}: PictureUploadModalProps) => {
  const { t } = useTranslation();
  const formComponent = useRef<HTMLFormElement>(null);
  const [isAiLabelEnabled] = useFeatureFlag(FeatureFlags.AI_LABEL);

  const schema = yup
    .object()
    .shape({
      description: yup.string().required().max(MAX_DESCRIPTION_LENGTH),
      copyrightHolder: yup.string().required(),
      isAiGenerated: isAiLabelEnabled
        ? yup.boolean().required()
        : yup.boolean(),
      ...(!imageToEdit && {
        file: yup
          .mixed()
          .test('type', (fileList: FileList) => {
            const fileType = fileList?.[0]?.type.split('/').pop();
            return ALLOWED_FILE_TYPES.includes(fileType);
          })
          .test('size', (fileList: FileList) => {
            return fileList?.[0]?.size < MAX_FILE_SIZE;
          })
          .required(),
      }),
    })
    .required();

  const {
    control,
    reset,
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const { field: descriptionField } = useController({
    name: 'description',
    control,
  });

  const { field: isAiGeneratedField } = useController({
    name: 'isAiGenerated',
    control,
  });

  const watchedFile = useWatch({ control, name: 'file' });
  const image = watchedFile?.[0];
  const isSelectingFile = !imageToEdit && (!image || !!errors.file);

  const [descriptionInputComponent] = useAutoFocus({
    retriggerOn: visible && !isSelectingFile,
  });

  useEffect(() => {
    const resetData = imageToEdit ?? {
      description: '',
      copyrightHolder: '',
    };
    reset(resetData);
  }, [imageToEdit, reset, visible]);

  useEffect(() => {
    setValue('file', draggedImageFile, {
      shouldValidate: !!draggedImageFile,
      shouldDirty: !!draggedImageFile,
    });
  }, [draggedImageFile, setValue]);

  const handleInternalOnDrop = (e: DragEvent<HTMLElement>) => {
    if (!e) return;

    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files.length === 0) return;

    setValue('file', files, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Modal
      title={t('pictures.upload_modal.title')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onClose={onClose}
      confirmTitle={
        imageToEdit
          ? t('pictures.upload_modal.actions.adjust')
          : t('pictures.upload_modal.actions.upload')
      }
      confirmLoading={loading}
      cancelTitle={t('pictures.upload_modal.actions.cancel')}
      size={ModalSizes.LG}
      onConfirm={() => {
        const isAiAnswerMissing =
          isAiLabelEnabled && isAiGeneratedField.value === undefined;

        if (!Object.keys(dirtyFields).length && !isAiAnswerMissing) {
          onClose();
        }

        formComponent.current.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true }),
        );
      }}
      confirmButtonDisabled={isSelectingFile || Object.keys(errors).length > 0}
    >
      <Stack
        as="form"
        ref={formComponent}
        spacing={4}
        padding={4}
        onSubmit={handleSubmit(async ({ isAiGenerated, ...data }) => {
          await onSubmitValid({
            ...data,
            ...(isAiLabelEnabled && { isAiGenerated }),
          });
          reset({});
        })}
      >
        {!imageToEdit && (
          <Input
            id="file"
            type="file"
            className="tw:hidden!"
            accept={ALLOWED_FILE_TYPES.map((file) => `.${file}`).join(',')}
            {...register('file')}
          />
        )}
        {isSelectingFile && (
          <PictureUploadBox
            error={
              errors?.file &&
              t(
                `pictures.upload_modal.validation_messages.file.${errors.file?.type}`,
                { maxFileSize: MAX_FILE_SIZE / 1_000_000 },
              )
            }
            onDrop={handleInternalOnDrop}
            onDragOver={(e) => e.preventDefault()}
          />
        )}
        {!isSelectingFile && (
          <Stack spacing={4}>
            <Box
              className={cn(
                'tw:grid tw:gap-4',
                (image || imageToEdit?.thumbnailUrl) &&
                  'tw:sm:grid-cols-[14rem_1fr]',
              )}
            >
              {image && <SelectedImage image={image} />}
              {imageToEdit?.thumbnailUrl && (
                <Image
                  src={`${imageToEdit.thumbnailUrl}?height=360`}
                  alt=""
                  className={cn(
                    'tw:h-48 tw:w-full tw:rounded-md tw:object-cover',
                    imageToEdit.isAiGenerated && 'tw:object-left-top',
                  )}
                />
              )}
              <Stack spacing={4}>
                <FormElement
                  id="description"
                  label={t('pictures.upload_modal.description_label')}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  error={
                    errors?.description &&
                    t(
                      `pictures.upload_modal.validation_messages.description.${errors.description.type}`,
                    )
                  }
                  Component={
                    <TextArea
                      rows={2}
                      {...descriptionField}
                      value={descriptionField.value ?? ''}
                      ref={(element: HTMLTextAreaElement) => {
                        descriptionField.ref(element);
                        descriptionInputComponent.current = element;
                      }}
                    />
                  }
                />
                <FormElement
                  id="copyrightHolder"
                  label={
                    <Inline alignItems="center" spacing={2}>
                      <Text>{t('pictures.upload_modal.copyright_label')}</Text>
                      <Tooltip
                        id="copyright-tooltip"
                        content={t(
                          'pictures.upload_modal.disclaimer.copyright',
                        )}
                      />
                    </Inline>
                  }
                  error={
                    errors?.copyrightHolder &&
                    t(
                      `pictures.upload_modal.validation_messages.copyrightHolder.${errors.copyrightHolder.type}`,
                    )
                  }
                  Component={<Input {...register('copyrightHolder')} />}
                />
              </Stack>
            </Box>
            {isAiLabelEnabled && (
              <AiGeneratedField
                name={isAiGeneratedField.name}
                value={isAiGeneratedField.value}
                error={
                  errors?.isAiGenerated &&
                  t(
                    `pictures.upload_modal.validation_messages.isAiGenerated.${errors.isAiGenerated.type}`,
                  )
                }
                onChange={isAiGeneratedField.onChange}
              />
            )}

            <Text variant={TextVariants.MUTED} fontSize="0.8rem">
              <Trans i18nKey="pictures.upload_modal.disclaimer.terms_and_conditions.text">
                <TermsAndConditionsLink />
                <CopyrightLink />
              </Trans>
            </Text>
          </Stack>
        )}
        <Button type="submit" className="tw:hidden!" />
      </Stack>
    </Modal>
  );
};

export { PictureUploadModal };
export type { FormData };
