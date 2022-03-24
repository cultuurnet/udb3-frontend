import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';

type Props = {
  visible: boolean;
  onConfirm: (videoUrl: string) => void;
  onClose: () => void;
};

const ALLOWED_VIDEO_SOURCES_REGEX: RegExp = /^http(s?):\/\/(www\.)?((youtube\.com\/watch\?v=([^/#&?]*))|(vimeo\.com\/([^/#&?]*))|(youtu\.be\/([^/#&?]*)))/;

type FormData = {
  link: string;
};

const schema = yup
  .object()
  .shape({
    link: yup.string().matches(ALLOWED_VIDEO_SOURCES_REGEX).required(),
  })
  .required();

const VideoLinkAddModal = ({ visible, onConfirm, onClose }: Props) => {
  const { t } = useTranslation();

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleConfirm = async () => {
    await handleSubmit((data) => {
      onConfirm(data.link);
    })();
  };

  return (
    <Modal
      title={t('videos.upload_modal.title')}
      confirmTitle={t('videos.upload_modal.actions.add')}
      cancelTitle={t('videos.upload_modal.actions.cancel')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onConfirm={handleConfirm}
      onClose={onClose}
      size={ModalSizes.MD}
    >
      <Stack
        as="form"
        padding={4}
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirm();
        }}
      >
        <FormElement
          Component={<Input {...register('link')} autoFocus />}
          id="video-link"
          label="Link"
          info={
            <Alert variant={AlertVariants.WARNING}>
              <Trans
                i18nKey="videos.upload_modal.link_requirements" // optional -> fallbacks to defaults if not provided
                components={{ bold: <Text fontWeight="bold" /> }}
              />
            </Alert>
          }
          error={
            formState.errors.link &&
            t('videos.upload_modal.validation_messages.link')
          }
        />
      </Stack>
    </Modal>
  );
};

export { VideoLinkAddModal };
