import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';

import { useDeleteVerenigingsloketByOrganizerIdMutation } from '@/hooks/api/organizers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { SupportedLanguage } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import {
  formatEmailAndPhone,
  parseAddress,
} from '@/utils/formatOrganizerDetail';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

import type { Verenigingsloket } from '../../../../types/Verenigingsloket';
import { OrganizerLabelsForm } from './OrganizerLabels';

type Props = {
  organizer: Organizer;
  isOwner: boolean;
  verenigingsloket?: Verenigingsloket;
};

const getGlobalValue = getValueFromTheme('global');

const { grey2, udbMainDarkGrey } = colors;

const OrganizerInfo = ({
  title,
  content,
  urls,
}: {
  title: string;
  content: string;
  urls?: string[];
}) => {
  const { t } = useTranslation();
  const isDescription =
    title.startsWith('organizers.detail.description') ||
    title.startsWith('organizers.detail.educationalDescription');
  return (
    <Inline
      padding={3}
      css={`
        border-bottom: 1px solid ${grey2};
      `}
    >
      <Text minWidth="15rem" color={udbMainDarkGrey} size={3}>
        {t(title)}
      </Text>
      <Stack>
        {(urls ?? []).map((url) => (
          <Link key={url} href={url}>
            {url}
          </Link>
        ))}
        {isDescription ? (
          <Text
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        ) : (
          <Text
            css={`
              white-space: pre-wrap;
            `}
            color={
              content?.startsWith('organizers.detail.no') && udbMainDarkGrey
            }
          >
            {content?.startsWith('organizers.detail.no') ? t(content) : content}
          </Text>
        )}
      </Stack>
    </Inline>
  );
};

const OrganizerImages = ({
  title,
  organizer,
  images,
}: {
  title: string;
  organizer: Organizer;
  images: Organizer['images'] | undefined;
}) => {
  const { t } = useTranslation();
  const isMainImage = (url: string) => {
    return url === organizer?.mainImage;
  };
  if (!images || images.length === 0) {
    return (
      <Inline padding={3}>
        <Text minWidth="15rem" color={udbMainDarkGrey}>
          {t(title)}
        </Text>
        <Text color={udbMainDarkGrey}>{t('organizers.detail.no_images')}</Text>
      </Inline>
    );
  }
  return (
    <Inline padding={3}>
      <Text minWidth="15rem" color={udbMainDarkGrey}>
        {t(title)}
      </Text>
      <Stack
        spacing={3}
        flex={1}
        css={`
          white-space: pre-wrap;
        `}
      >
        {images?.map((image) => (
          <Inline
            key={image['@id']}
            spacing={4}
            paddingTop={3}
            paddingBottom={3}
            css={`
              &:not(:last-child) {
                border-bottom: 1px solid ${grey2};
              }
            `}
          >
            <Inline>
              <Link href={image.contentUrl}>
                <Image
                  width={300}
                  src={image.thumbnailUrl}
                  alt={image.description}
                />
              </Link>
            </Inline>
            <Stack>
              {isMainImage(image.thumbnailUrl) && (
                <Text
                  backgroundColor={udbMainDarkGrey}
                  color="white"
                  alignSelf="flex-start"
                  borderRadius="3px"
                  paddingRight={3}
                  paddingLeft={3}
                  fontSize="0.8rem"
                  fontWeight="bold"
                >
                  {t('organizers.detail.mainImage')}
                </Text>
              )}
              <Text>{image.description}</Text>
              <Text color={udbMainDarkGrey}>
                {`© ${image.copyrightHolder}`}
              </Text>
            </Stack>
          </Inline>
        ))}
      </Stack>
    </Inline>
  );
};

const OrganizerLabels = ({
  title,
  organizer,
}: {
  title: string;
  organizer: Organizer;
}) => {
  const { t } = useTranslation();
  return (
    <Inline
      padding={3}
      css={`
        border-bottom: 1px solid ${grey2};
      `}
    >
      <Text minWidth="15rem" color={udbMainDarkGrey}>
        {t(title)}
      </Text>
      <OrganizerLabelsForm organizer={organizer} />
    </Inline>
  );
};

type VerenigingsloketProps = {
  isOwner: boolean;
  organizerId: string;
  organizerName: string;
} & Verenigingsloket;

const VerenigingsloketPreview = ({
  vcode,
  status,
  url,
  isOwner,
  organizerId,
  organizerName,
}: VerenigingsloketProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showVerenigingsloket] = useFeatureFlag(FeatureFlags.VERENIGINGSLOKET);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deleteVerenigingsloketMutation =
    useDeleteVerenigingsloketByOrganizerIdMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['organizers-verenigingsloket', organizerId],
        });
      },
      onError: (error) => {
        console.warn('Failed to delete verenigingsloket:', error);
        setIsDeleteModalVisible(false);
      },
    });

  if (!showVerenigingsloket) return null;

  const previewUrl = url.replace('https://www.', '');

  const helpdeskUrl =
    'https://helpdesk.publiq.be/hc/nl/articles/31862043316114-Waarom-zie-ik-een-link-met-het-Verenigingsloket-op-mijn-organisatiepagina';

  const handleDelete = async () => {
    try {
      await deleteVerenigingsloketMutation.mutateAsync({
        id: organizerId,
      });
      setIsDeleteModalVisible(false);
    } catch (error) {}
  };

  return (
    <Inline
      padding={3}
      css={`
        border-top: 1px solid ${grey2};
      `}
    >
      <Modal
        title={t('organizers.detail.verenigingsloket.delete_modal.title')}
        confirmTitle={t(
          'organizers.detail.verenigingsloket.delete_modal.actions.confirm',
        )}
        cancelTitle={t(
          'organizers.detail.verenigingsloket.delete_modal.actions.cancel',
        )}
        visible={isDeleteModalVisible}
        variant={ModalVariants.QUESTION}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalVisible(false)}
        size={ModalSizes.MD}
        confirmButtonVariant={ButtonVariants.DANGER}
      >
        <Stack padding={4} spacing={4}>
          <Text>
            <Trans
              i18nKey="organizers.detail.verenigingsloket.delete_modal.intro"
              values={{ organizerName }}
            >
              <span style={{ fontWeight: 'bold' }}>{organizerName}</span>
            </Trans>
          </Text>
          <Text fontWeight="bold">
            {t('organizers.detail.verenigingsloket.delete_modal.text')}
          </Text>
        </Stack>
      </Modal>
      <Text minWidth="15rem" color={udbMainDarkGrey}>
        {t('organizers.detail.verenigingsloket.title')}
      </Text>
      <Stack spacing={3}>
        {status === 'confirmed' && <Link href={url}>{previewUrl}</Link>}
        {isOwner && (
          <Text variant="muted">
            {status === 'confirmed' && (
              <Trans i18nKey="organizers.detail.verenigingsloket.description_owner">
                <Link href={helpdeskUrl}></Link>
              </Trans>
            )}
            {status === 'cancelled' && (
              <Trans i18nKey="organizers.detail.verenigingsloket.description_add_new">
                <Link href="https://www.verenigingsloket.be/nl">
                  https://www.verenigingsloket.be/nl
                </Link>
              </Trans>
            )}
          </Text>
        )}
        {!isOwner && (
          <Text variant="muted">
            {t('organizers.detail.verenigingsloket.description')}
          </Text>
        )}
        {isOwner && status === 'confirmed' && (
          <Inline>
            <Button
              iconName={Icons.TRASH}
              spacing={3}
              variant={ButtonVariants.DANGER}
              size="sm"
              onClick={() => setIsDeleteModalVisible(true)}
            >
              {t('organizers.detail.verenigingsloket.delete_cta')}
            </Button>
          </Inline>
        )}
      </Stack>
    </Inline>
  );
};

export const OrganizerTable = ({
  organizer,
  verenigingsloket,
  isOwner,
}: Props) => {
  const { i18n } = useTranslation();
  const organizerId = parseOfferId(organizer['@id']);

  const formattedName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

  const formattedDescription: string | undefined = organizer?.description
    ? sanitizeHtml(
        getLanguageObjectOrFallback(
          organizer?.description,
          i18n.language as SupportedLanguage,
          organizer?.mainLanguage as SupportedLanguage,
        ),
      )
    : undefined;

  const formattedEducationalDescription: string | undefined =
    organizer?.educationalDescription
      ? sanitizeHtml(
          getLanguageObjectOrFallback(
            organizer?.educationalDescription,
            i18n.language as SupportedLanguage,
            organizer?.mainLanguage as SupportedLanguage,
          ),
        )
      : undefined;

  const formattedEmailAndPhone =
    organizer?.contactPoint &&
    !Object.values(organizer.contactPoint).every((array) => array.length === 0)
      ? formatEmailAndPhone(organizer?.contactPoint)
      : 'organizers.detail.no_contact';

  const formattedAddress = organizer?.address
    ? parseAddress(
        organizer,
        i18n.language as SupportedLanguage,
        organizer?.mainLanguage as SupportedLanguage,
      )
    : 'organizers.detail.no_address';
  const organizerDetailInfo = [
    { title: 'organizers.detail.name', content: formattedName },
    formattedDescription && {
      title: 'organizers.detail.description',
      content: formattedDescription,
    },
    formattedEducationalDescription && {
      title: 'organizers.detail.educationalDescription',
      content: formattedEducationalDescription,
    },
    { title: 'organizers.detail.address', content: formattedAddress },
    {
      title: 'organizers.detail.contact',
      content: formattedEmailAndPhone,
      urls: organizer?.contactPoint?.url,
    },
  ].filter((item) => item);
  return (
    <Stack
      flex={1}
      padding={4}
      marginBottom={5}
      borderRadius="0.5rem"
      backgroundColor="white"
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
    >
      {organizerDetailInfo?.map((info) => (
        <OrganizerInfo
          key={info?.title}
          title={info?.title}
          content={info?.content}
          urls={info?.urls}
        />
      ))}
      <OrganizerLabels title="organizers.detail.labels" organizer={organizer} />
      <OrganizerImages
        title="organizers.detail.images"
        organizer={organizer}
        images={organizer?.images}
      />
      {verenigingsloket?.vcode && (
        <VerenigingsloketPreview
          vcode={verenigingsloket.vcode}
          status={verenigingsloket.status}
          url={verenigingsloket.url}
          isOwner={isOwner}
          organizerId={organizerId}
          organizerName={formattedName}
        />
      )}
    </Stack>
  );
};
