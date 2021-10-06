import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import * as yup from 'yup';

import {
  useAddImageToEvent,
  useDeleteImageFromEvent,
  useGetEventById,
  useUpdateImageFromEvent,
} from '@/hooks/api/events';
import { useAddImage } from '@/hooks/api/images';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { InputWithLabel } from '@/ui/InputWithLabel';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Paragraph } from '@/ui/Paragraph';
import type { StackProps } from '@/ui/Stack';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { TextAreaWithLabel } from '@/ui/TextAreaWithLabel';
import { getValueFromTheme } from '@/ui/theme';
import { parseOfferId } from '@/utils/parseOfferId';

import type { MachineProps } from './create';
import { DeleteModal } from './DeleteModal';
import { Step } from './Step';

const getValue = getValueFromTheme('moviesCreatePage');

type Step5Props = StackProps & MachineProps;

type FormData = {
  description: string;
  copyrightHolder: string;
  file: FileList;
};

type PictureUploadModalProps = {
  visible: boolean;
  onClose: () => void;
  imageToEdit?: { description: string; copyrightHolder: string };
  onSubmitValid: (data: FormData) => void;
};

const MAX_FILE_SIZE = 5000000;

const PictureUploadModal = ({
  visible,
  onClose,
  imageToEdit,
  onSubmitValid,
}: PictureUploadModalProps) => {
  const { t } = useTranslation();
  const formComponent = useRef<HTMLFormElement>();

  const schema = yup
    .object()
    .shape({
      description: yup.string().required().max(250),
      copyrightHolder: yup.string().required(),
      ...(!imageToEdit && {
        file: yup
          .mixed()
          .test((fileList: FileList) => fileList?.[0]?.size < MAX_FILE_SIZE)
          .required(),
      }),
    })
    .required();

  const {
    watch,
    reset,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchedFile = watch('file');
  const image = watchedFile?.[0];
  const imagePreviewUrl = image && URL.createObjectURL(image);

  useEffect(() => {
    reset(imageToEdit ?? {});
  }, [imageToEdit, reset]);

  const handleClickUpload = () => {
    document.getElementById('file').click();
  };

  return (
    <Modal
      title={t('movies.create.edit_modal.title')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onClose={onClose}
      confirmTitle={imageToEdit ? 'Aanpassen' : 'Uploaden'}
      cancelTitle="Annuleren"
      size={ModalSizes.MD}
      onConfirm={() => {
        formComponent.current.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true }),
        );
      }}
      confirmButtonDisabled={Object.keys(errors).length > 0}
    >
      <Stack
        as="form"
        ref={formComponent}
        spacing={4}
        padding={4}
        onSubmit={handleSubmit(onSubmitValid)}
      >
        {!imageToEdit && (
          <Stack
            flex={1}
            spacing={4}
            height={300}
            backgroundColor={getValue('pictureUploadBox.backgroundColor')}
            justifyContent="center"
            alignItems="center"
            css={`
              border: 1px solid ${getValue('pictureUploadBox.borderColor')};
            `}
            padding={4}
          >
            <Text key="select" fontWeight={700}>
              Selecteer je foto
            </Text>
            {imagePreviewUrl ? (
              <Stack spacing={2}>
                <Image
                  src={imagePreviewUrl}
                  alt="preview"
                  width="auto"
                  maxHeight="8rem"
                  objectFit="cover"
                />
                <Text>{image.name}</Text>
              </Stack>
            ) : (
              <Icon
                name={Icons.IMAGE}
                width="auto"
                height="8rem"
                color={getValue('pictureUploadBox.imageIconColor')}
              />
            )}
            <Stack spacing={2} alignItems="center">
              <Text>Sleep een bestand hierheen of</Text>
              <Input
                id="file"
                type="file"
                display="none"
                accept=".jpg,.jpeg,.gif,.png"
                {...register('file')}
              />
              <Button onClick={handleClickUpload}>Kies bestand</Button>
              <Text>{errors?.file?.message ?? ''}</Text>
            </Stack>
            <Text variant={TextVariants.MUTED} textAlign="center">
              De maximale grootte van je afbeelding is 5MB en heeft als type
              .jpeg, .gif of .png
            </Text>
          </Stack>
        )}
        <InputWithLabel
          id="description"
          label="Beschrijving"
          info="Maximum 250 karakters"
          required
          error={
            errors.description &&
            t(
              `movies.create.edit_modal.validation_messages.description.${errors.description.type}`,
            )
          }
          {...register('description')}
        />

        <InputWithLabel
          id="copyrightHolder"
          label="Copyright"
          required
          info={
            <Stack spacing={3}>
              <Paragraph>
                Vermeld de naam van de rechtenhoudende fotograaf. Vul alleen de
                naam van je eigen vereniging of organisatie in als je zelf de
                rechten bezit (minimum 2 karakters).
              </Paragraph>
              <Paragraph>
                Je staat op het punt (een) afbeelding(en) toe te voegen en
                openbaar te verspreiden. Je dient daartoe alle geldende auteurs-
                en portretrechten te respecteren, alsook alle andere
                toepasselijke wetgeving. Je kan daarvoor aansprakelijk worden
                gehouden, zoals vastgelegd in de algemene voorwaarden. Meer
                informatie over copyright
              </Paragraph>
            </Stack>
          }
          error={
            errors.copyrightHolder &&
            t(
              `movies.create.edit_modal.validation_messages.copyrightHolder.${errors.copyrightHolder.type}`,
            )
          }
          {...register('copyrightHolder')}
        />
        <Text>
          <Text color="red">*</Text> verplicht veld
        </Text>
      </Stack>
    </Modal>
  );
};

const Step5 = ({ movieState, sendMovieEvent, ...props }: Step5Props) => {
  const eventId = '1633a062-349e-482e-9d88-cde754c45f71';

  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [
    isPictureUploadModalVisible,
    setIsPictureUploadModalVisible,
  ] = useState(false);
  const [
    isPictureDeleteModalVisible,
    setIsPictureDeleteModalVisible,
  ] = useState(false);
  const [imageToEditId, setImageToEditId] = useState('');
  const [imageToDeleteId, setImageToDeleteId] = useState('');

  // @ts-expect-error
  const getEventByIdQuery = useGetEventById({ id: eventId });

  // @ts-expect-error
  const images = useMemo(() => getEventByIdQuery.data?.mediaObject ?? [], [
    // @ts-expect-error
    getEventByIdQuery.data,
  ]);

  const imageToEdit = useMemo(() => {
    const image = images.find(
      (image) => parseOfferId(image['@id']) === imageToEditId,
    );

    if (!image) return null;

    const { file, ...imageWithoutFile } = image;

    return imageWithoutFile;
  }, [images, imageToEditId]);

  const invalidateEventQuery = async () =>
    await queryClient.invalidateQueries(['events', { id: eventId }]);

  const handleSuccessAddImage = ({ imageId }) =>
    addImageToEventMutation.mutate({ eventId, imageId });

  const addImageMutation = useAddImage({
    onSuccess: handleSuccessAddImage,
  });

  const addImageToEventMutation = useAddImageToEvent({
    onSuccess: () => {
      setIsPictureUploadModalVisible(false);
      invalidateEventQuery();
    },
  });

  const updateImageFromEventMutation = useUpdateImageFromEvent({
    onSuccess: () => {
      setIsPictureUploadModalVisible(false);
      invalidateEventQuery();
    },
  });

  const handleSuccessDeleteImage = invalidateEventQuery;

  const deleteImageFromEventMutation = useDeleteImageFromEvent({
    onSuccess: handleSuccessDeleteImage,
  });

  const handleClickAddImage = () => {
    setImageToEditId(undefined);
    setIsPictureUploadModalVisible(true);
  };
  const handleCloseModal = () => setIsPictureUploadModalVisible(false);

  const handleClickEditImage = (imageId: string) => {
    setImageToEditId(imageId);
    setIsPictureUploadModalVisible(true);
  };

  const handleClickDeleteImage = (imageId: string) => {
    setImageToDeleteId(imageId);
    setIsPictureDeleteModalVisible(true);
  };

  const handleConfirmDelete = (imageId: string) => {
    deleteImageFromEventMutation.mutate({ eventId, imageId });
    setIsPictureDeleteModalVisible(false);
  };

  const handleSubmitValid = ({
    file,
    description,
    copyrightHolder,
  }: FormData) => {
    if (imageToEdit) {
      updateImageFromEventMutation.mutate({
        eventId,
        imageId: parseOfferId(imageToEdit['@id']),
        description,
        copyrightHolder,
      });

      return;
    }

    addImageMutation.mutate({
      description,
      copyrightHolder,
      file: file?.[0],
      language: i18n.language,
    });
  };

  return (
    <Step stepNumber={5}>
      <PictureUploadModal
        visible={isPictureUploadModalVisible}
        onClose={handleCloseModal}
        imageToEdit={imageToEdit}
        onSubmitValid={handleSubmitValid}
      />
      <DeleteModal
        visible={isPictureDeleteModalVisible}
        onConfirm={() => handleConfirmDelete(imageToDeleteId)}
        onClose={() => setIsPictureDeleteModalVisible(false)}
      />
      <Inline spacing={6}>
        <Stack spacing={3} flex={1}>
          <TextAreaWithLabel
            label={t('movies.create.actions.description')}
            value=""
            onInput={() => {}}
            rows={10}
          />
          <Button variant={ButtonVariants.LINK}>leegmaken</Button>
        </Stack>
        <Stack
          flex={1}
          spacing={3}
          height={300}
          backgroundColor={getValue('pictureUploadBox.backgroundColor')}
          justifyContent="center"
          css={`
            border: 1px solid ${getValue('pictureUploadBox.borderColor')};
          `}
          {...props}
        >
          {images.map((image) => (
            <Inline key={image.description} alignItems="center" spacing={3}>
              <Image
                src={image.thumbnailUrl}
                alt={image.description}
                width={200}
              />
              <Stack spacing={3}>
                <Button
                  variant={ButtonVariants.PRIMARY}
                  iconName={Icons.PENCIL}
                  spacing={3}
                  onClick={() =>
                    handleClickEditImage(parseOfferId(image['@id']))
                  }
                >
                  Wijzigen
                </Button>
                <Button
                  variant={ButtonVariants.DANGER}
                  iconName={Icons.TRASH}
                  spacing={3}
                  onClick={() =>
                    handleClickDeleteImage(parseOfferId(image['@id']))
                  }
                >
                  Verwijderen
                </Button>
              </Stack>
            </Inline>
          ))}
          <Stack alignItems="center">
            <Text variant={TextVariants.MUTED}>
              Voeg een afbeelding toe zodat bezoekers je activiteit beter
              herkennen
            </Text>
            <Button
              variant={ButtonVariants.SECONDARY}
              onClick={handleClickAddImage}
            >
              Afbeelding toevoegen
            </Button>
          </Stack>
        </Stack>
      </Inline>
    </Step>
  );
};

export { Step5 };
