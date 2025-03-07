import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useAddImageMutation } from '@/hooks/api/images';
import {
  useAddOfferImageMutation,
  useUpdateOfferImageMutation,
} from '@/hooks/api/offers';

import { ImageType } from '../PictureUploadBox';
import {
  FormData,
  PictureUploadModal,
} from '../steps/modals/PictureUploadModal';

type Props = {
  eventId: string;
  scope: string;
  isImageUploading: boolean;
  isPictureUploadModalVisible: boolean;
  onModalClose: () => void;
  onImageUploadStart: () => void;
  onImageUploadEnd: () => void;
};

export const DashboardPictureUploadModal = ({
  eventId,
  scope,
  isImageUploading,
  isPictureUploadModalVisible,
  onModalClose,
  onImageUploadStart,
  onImageUploadEnd,
}: Props) => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [draggedImageFile, setDraggedImageFile] = useState<FileList>();
  const [images, setImages] = useState<ImageType[]>([]);
  const [imageToEditId, setImageToEditId] = useState('');
  const imageToEdit = useMemo(() => {
    const image = images.find((image) => image.parsedId === imageToEditId);

    if (!image) return null;

    const { file, ...imageWithoutFile } = image;

    return imageWithoutFile;
  }, [images, imageToEditId]);

  const addImageToEventMutation = useAddOfferImageMutation({
    onSuccess: () => {
      onModalClose();
      setTimeout(async () => {
        await queryClient.invalidateQueries('events');
        await queryClient.invalidateQueries('organizers');
        onImageUploadEnd();
      }, 1000);
    },
  });

  const handleSuccessAddImage = ({ imageId }) => {
    return addImageToEventMutation.mutate({ eventId, imageId, scope });
  };

  const addImageMutation = useAddImageMutation({
    onSuccess: handleSuccessAddImage,
  });

  const updateOfferImageMutation = useUpdateOfferImageMutation({
    onSuccess: async () => {
      onModalClose();
    },
  });

  const handleSubmitValid = async ({
    file,
    description,
    copyrightHolder,
  }: FormData) => {
    try {
      onImageUploadStart();
      if (imageToEdit) {
        await updateOfferImageMutation.mutateAsync({
          eventId,
          imageId: imageToEdit.parsedId,
          description,
          copyrightHolder,
          scope,
        });
        return;
      }

      await addImageMutation.mutateAsync({
        description,
        copyrightHolder,
        file: file?.[0],
        language: i18n.language,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };
  return (
    <PictureUploadModal
      visible={isPictureUploadModalVisible}
      onClose={() => onModalClose()}
      draggedImageFile={draggedImageFile}
      imageToEdit={imageToEdit}
      onSubmitValid={handleSubmitValid}
      loading={isImageUploading}
    />
  );
};
