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
  const { udbMainLightGrey } = colors;

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
          />
        </Link>
        <Stack spacing={1}>
          {index === 0 && (
            <Text className="tw:self-start tw:rounded-[3px] tw:bg-udb-main-dark-grey tw:pr-[0.5333rem] tw:pl-[0.5333rem] tw:text-[0.8rem] tw:font-bold tw:text-white">
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
