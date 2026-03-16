import { useTranslation } from 'react-i18next';

import { MediaObject } from '@/types/Offer';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { colors } from '@/ui/theme';

import { EmptyValue } from './EmptyValue';

type Props = {
  mediaObject: MediaObject[];
};

const ImagePreview = ({ mediaObject }: Props) => {
  const { t } = useTranslation();
  const HEIGHT = 100;
  const hasImages = (mediaObject ?? []).length > 0;
  const { udbMainLightGrey, udbMainDarkGrey } = colors;

  if (!hasImages)
    return <EmptyValue>{t('preview.empty_value.images')}</EmptyValue>;

  return mediaObject?.map((media, index) => {
    const isLastImage = index === mediaObject!.length - 1;
    return (
      <Inline
        spacing={4}
        key={media['@id']}
        alignItems="center"
        paddingBottom={3}
        marginBottom={4}
        css={`
          border-bottom: ${isLastImage
            ? 'none'
            : `1px solid ${udbMainLightGrey}`};
        `}
      >
        <Link href={media.contentUrl} target="_blank">
          <Image
            src={`${media.thumbnailUrl}?height=${HEIGHT}`}
            alt={media.description}
            width="auto"
          />
        </Link>
        <Stack spacing={1}>
          {index === 0 && (
            <Text
              backgroundColor={udbMainDarkGrey}
              color={colors.white}
              alignSelf="flex-start"
              borderRadius="3px"
              paddingRight={3}
              paddingLeft={3}
              fontSize="0.8rem"
              fontWeight="bold"
            >
              {t('preview.main_image')}
            </Text>
          )}
          <Text>{media.description}</Text>
          <Text variant={TextVariants.MUTED}>© {media.copyrightHolder}</Text>
        </Stack>
      </Inline>
    );
  });
};

export { ImagePreview };
