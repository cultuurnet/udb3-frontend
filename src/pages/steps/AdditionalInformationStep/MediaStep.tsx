import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ScopeTypes } from '@/constants/OfferType';
import { useAddImageMutation } from '@/hooks/api/images';
import {
  useAddOfferImageMutation,
  useAddOfferMainImageMutation,
  useAddOfferVideoMutation,
  useDeleteOfferImageMutation,
  useDeleteOfferVideoMutation,
  useUpdateOfferImageMutation,
} from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import {
  TabContentProps,
  ValidationStatus,
} from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import type { FormData } from '@/pages/steps/modals/PictureUploadModal';
import { Inline } from '@/ui/Inline';
import { getStackProps, Stack } from '@/ui/Stack';
import { Breakpoints } from '@/ui/theme';
import { parseOfferId } from '@/utils/parseOfferId';
import { isFulfilledResult } from '@/utils/promise';

import type { ImageType } from '../../PictureUploadBox';
import { PictureUploadBox } from '../../PictureUploadBox';
import { VideoLinkAddModal } from '../../VideoLinkAddModal';
import { VideoLinkDeleteModal } from '../../VideoLinkDeleteModal';
import type { Video, VideoEnriched } from '../../VideoUploadBox';
import { VideoUploadBox } from '../../VideoUploadBox';
import { PictureDeleteModal } from '../modals/PictureDeleteModal';
import { PictureUploadModal } from '../modals/PictureUploadModal';

const getYoutubeThumbnailUrl = (videoUrl: string) => {
  const matches = videoUrl.match(/(?:shorts\/|v=|youtu\.be\/)([^&?/]+)/);

  return matches
    ? `https://img.youtube.com/vi_webp/${matches[1]}/maxresdefault.webp`
    : '';
};

const MediaStep = ({
  scope,
  offerId,
  onSuccessfulChange,
  onValidationChange,
  ...props
}: TabContentProps) => {
  const { i18n } = useTranslation();

  // TODO: refactor
  const eventId = offerId;

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });

  const videosFromQuery = useMemo(
    () => getEntityByIdQuery.data?.videos ?? [],
    [getEntityByIdQuery.data?.videos],
  );

  const mediaObjects = useMemo(
    () =>
      getEntityByIdQuery.data?.mediaObject ??
      getEntityByIdQuery.data?.images ??
      [],
    [getEntityByIdQuery.data],
  );

  const eventImage = useMemo(() => {
    if (scope === ScopeTypes.ORGANIZERS) {
      return getEntityByIdQuery.data?.mainImage;
    }
    return getEntityByIdQuery.data?.image ?? [];
  }, [
    getEntityByIdQuery.data?.image,
    getEntityByIdQuery.data?.mainImage,
    scope,
  ]);

  const [isPictureUploadModalVisible, setIsPictureUploadModalVisible] =
    useState(false);
  const [isPictureDeleteModalVisible, setIsPictureDeleteModalVisible] =
    useState(false);
  const [isVideoLinkAddModalVisible, setIsVideoLinkAddModalVisible] =
    useState(false);
  const [isVideoLinkDeleteModalVisible, setIsVideoLinkDeleteModalVisible] =
    useState(false);

  const [imageToEditId, setImageToEditId] = useState('');
  const [draggedImageFile, setDraggedImageFile] = useState<FileList>();
  const [imageToDeleteId, setImageToDeleteId] = useState('');
  const [videoToDeleteId, setVideoToDeleteId] = useState('');

  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const addImageToEventMutation = useAddOfferImageMutation({
    onSuccess: async () => {
      setIsPictureUploadModalVisible(false);
      onSuccessfulChange();
    },
  });

  const handleSuccessAddImage = ({ imageId }) => {
    return addImageToEventMutation.mutate({ eventId, imageId, scope });
  };

  const addImageMutation = useAddImageMutation({
    onSuccess: handleSuccessAddImage,
  });

  const addOfferMainImageMutation = useAddOfferMainImageMutation({
    onSuccess: onSuccessfulChange,
  });

  const updateOfferImageMutation = useUpdateOfferImageMutation({
    onSuccess: async () => {
      setIsPictureUploadModalVisible(false);
      onSuccessfulChange();
    },
  });

  const deleteOfferImageMutation = useDeleteOfferImageMutation({
    onSuccess: async () => {
      setIsPictureUploadModalVisible(false);
      onSuccessfulChange();
    },
  });

  const addOfferVideoMutation = useAddOfferVideoMutation({
    onSuccess: async () => {
      setIsVideoLinkDeleteModalVisible(false);
      onSuccessfulChange();
    },
  });

  const deleteOfferVideoMutation = useDeleteOfferVideoMutation({
    onSuccess: async () => {
      setIsVideoLinkDeleteModalVisible(false);
      onSuccessfulChange();
    },
  });

  const enrichVideos = async (video: Video[]) => {
    /**
     * Possible url structures
     * - https://vimeo.com/318783762
     * - https://vimeo.com/318783762/
     * - https://vimeo.com/318783762#embed
     * - https://vimeo.com/812334876/126ed60cae
     */
    const getVimeoThumbnailUrl = async (videoUrl: string) => {
      try {
        const url = new URL(videoUrl);
        const pathName = url.pathname;

        const pathParts = pathName.split('/');

        // take the numeric part after /
        const videoId = pathParts.find((part) => {
          if (part === '') {
            return false;
          }

          return Number.isInteger(Number(part));
        });

        if (!videoId) {
          return '';
        }

        const response = await fetch(
          `https://vimeo.com/api/v2/video/${videoId}.json`,
        );

        const data = await response.json();

        return data?.[0]?.thumbnail_small;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);

        return '';
      }
    };

    const convertAllVideoUrlsPromises = video.map(async ({ url, ...video }) => {
      const isYoutubeUrl = url.includes('youtube') || url.includes('youtu.be');
      const isVimeoUrl = url.includes('vimeo');

      let thumbnailUrl = '';

      if (isYoutubeUrl) {
        thumbnailUrl = getYoutubeThumbnailUrl(url);
      }

      if (isVimeoUrl) {
        thumbnailUrl = await getVimeoThumbnailUrl(url);
      }

      const enrichedVideo: VideoEnriched = {
        ...video,
        url,
        thumbnailUrl,
      };

      return enrichedVideo;
    });

    const data = await Promise.allSettled(convertAllVideoUrlsPromises);

    const successVideos = data
      .filter(isFulfilledResult)
      .map((res) => res.value);

    setVideos(successVideos);
  };

  useEffect(() => {
    if (!videosFromQuery || videosFromQuery.length === 0) {
      setVideos([]);
      return;
    }

    enrichVideos(videosFromQuery as Video[]);
  }, [videosFromQuery]);

  useEffect(() => {
    if (!mediaObjects || mediaObjects.length === 0) {
      setImages([]);
      return;
    }
    const parsedMediaObjects = mediaObjects.map((mediaObject) => ({
      parsedId: parseOfferId(mediaObject['@id']),
      isMain: mediaObject.contentUrl === eventImage,
      ...mediaObject,
    }));

    setImages([
      ...parsedMediaObjects.filter((mediaObject) => mediaObject.isMain),
      ...parsedMediaObjects.filter((mediaObject) => !mediaObject.isMain),
    ] as ImageType[]);
  }, [eventImage, mediaObjects]);

  useEffect(() => {
    const hasImages = images.length > 0;
    const hasVideos = videos.length > 0;

    onValidationChange(
      hasImages || hasVideos ? ValidationStatus.SUCCESS : ValidationStatus.NONE,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, videos]);

  const imageToEdit = useMemo(() => {
    const image = images.find((image) => image.parsedId === imageToEditId);

    if (!image) return null;

    const { file, ...imageWithoutFile } = image;

    return imageWithoutFile;
  }, [images, imageToEditId]);

  const handleClickAddImage = () => {
    setImageToEditId(undefined);
    setIsPictureUploadModalVisible(true);
  };

  const handleDragAddImage = (files: FileList) => {
    setImageToEditId(undefined);
    setDraggedImageFile(files);
    setIsPictureUploadModalVisible(true);
  };

  const handleClickEditImage = (imageId: string) => {
    setImageToEditId(imageId);
    setIsPictureUploadModalVisible(true);
  };

  const handleClickDeleteImage = (imageId: string) => {
    setImageToDeleteId(imageId);
    setIsPictureDeleteModalVisible(true);
  };

  const handleClickSetMainImage = useCallback(
    (imageId: string) =>
      addOfferMainImageMutation.mutate({ eventId, imageId, scope }),
    [addOfferMainImageMutation, eventId, scope],
  );

  const handleConfirmDeleteImage = (imageId: string) => {
    deleteOfferImageMutation.mutate({ eventId, imageId, scope });
    setIsPictureDeleteModalVisible(false);
  };

  const handleAddVideoLink = (url: string) => {
    addOfferVideoMutation.mutate({
      eventId,
      url,
      language: i18n.language,
      scope,
    });
    setIsVideoLinkAddModalVisible(false);
  };

  const handleDeleteVideoLink = (videoId: string) => {
    setVideoToDeleteId(videoId);
    setIsVideoLinkDeleteModalVisible(true);
  };

  const handleConfirmDeleteVideo = (videoId: string) => {
    deleteOfferVideoMutation.mutate({ eventId, videoId, scope });
    setIsVideoLinkDeleteModalVisible(false);
  };

  const handleSubmitValid = async ({
    file,
    description,
    copyrightHolder,
  }: FormData) => {
    try {
      setIsImageUploading(true);
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
    } finally {
      setIsImageUploading(false);
    }
  };

  return (
    <Stack {...getStackProps(props)}>
      <PictureUploadModal
        visible={isPictureUploadModalVisible}
        onClose={() => setIsPictureUploadModalVisible(false)}
        draggedImageFile={draggedImageFile}
        imageToEdit={imageToEdit}
        onSubmitValid={handleSubmitValid}
        loading={isImageUploading}
      />
      <PictureDeleteModal
        visible={isPictureDeleteModalVisible}
        onConfirm={() => handleConfirmDeleteImage(imageToDeleteId)}
        onClose={() => setIsPictureDeleteModalVisible(false)}
      />
      <VideoLinkAddModal
        visible={isVideoLinkAddModalVisible}
        onConfirm={handleAddVideoLink}
        onClose={() => setIsVideoLinkAddModalVisible(false)}
      />
      <VideoLinkDeleteModal
        visible={isVideoLinkDeleteModalVisible}
        onConfirm={() => handleConfirmDeleteVideo(videoToDeleteId)}
        onClose={() => setIsVideoLinkDeleteModalVisible(false)}
      />
      <Inline
        spacing={4}
        alignItems={
          images.length > 0 || videos.length ? 'flex-start' : 'stretch'
        }
        stackOn={Breakpoints.M}
      >
        <PictureUploadBox
          width="48%"
          scope={scope}
          images={images}
          onClickEditImage={handleClickEditImage}
          onClickDeleteImage={handleClickDeleteImage}
          onClickSetMainImage={handleClickSetMainImage}
          onClickAddImage={handleClickAddImage}
          onDragAddImage={handleDragAddImage}
        />
        {scope !== ScopeTypes.ORGANIZERS && (
          <VideoUploadBox
            width="48%"
            videos={videos}
            onClickAddVideo={() => setIsVideoLinkAddModalVisible(true)}
            onClickDeleteVideo={handleDeleteVideoLink}
          />
        )}
      </Inline>
    </Stack>
  );
};

export { getYoutubeThumbnailUrl, MediaStep };
