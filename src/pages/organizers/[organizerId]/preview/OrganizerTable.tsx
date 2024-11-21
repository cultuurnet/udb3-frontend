import { useTranslation } from 'react-i18next';

import { SupportedLanguage } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import {
  formatEmailAndPhone,
  parseAddress,
  replaceHTMLTags,
} from '@/utils/formatOrganizerDetail';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { OrganizerLabels } from './OrganizerLabels';

type Props = { organizer: Organizer };

const getGlobalValue = getValueFromTheme('global');

export const OrganizerTable = ({ organizer }: Props) => {
  const { grey2, udbMainDarkGrey } = colors;
  const { t, i18n } = useTranslation();

  const formattedName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

  const formattedDescription: string = organizer?.description
    ? replaceHTMLTags(
        getLanguageObjectOrFallback(
          organizer?.description,
          i18n.language as SupportedLanguage,
          organizer?.mainLanguage as SupportedLanguage,
        ),
      )
    : null;

  const formattedEducationalDescription: string =
    organizer?.educationalDescription
      ? replaceHTMLTags(
          getLanguageObjectOrFallback(
            organizer?.educationalDescription,
            i18n.language as SupportedLanguage,
            organizer?.mainLanguage as SupportedLanguage,
          ),
        )
      : null;

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

  const isMainImage = (url: string) => {
    return url === organizer?.mainImage;
  };

  const renderOrganizerInfo = (
    title: string,
    content: string,
    urls?: string[],
  ) => {
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
          {urls &&
            urls.map((url) => (
              <Link key={url} href={url}>
                {url}
              </Link>
            ))}
          <Text
            size={3}
            css={`
              white-space: pre-wrap;
            `}
            color={
              content?.startsWith('organizers.detail.no') && udbMainDarkGrey
            }
          >
            {content?.startsWith('organizers.detail.no') ? t(content) : content}
          </Text>
        </Stack>
      </Inline>
    );
  };

  const renderOrganizerImages = (
    title: string,
    images: Organizer['images'] | undefined,
  ) => {
    if (!images || images.length === 0) {
      return (
        <Inline padding={3}>
          <Text minWidth="15rem" color={udbMainDarkGrey}>
            {t(title)}
          </Text>
          <Text color={udbMainDarkGrey}>
            {t('organizers.detail.no_images')}
          </Text>
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

  const renderOrganizerLabels = (title: string, organizer: Organizer) => {
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
        <OrganizerLabels organizer={organizer} />
      </Inline>
    );
  };

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
      {renderOrganizerInfo('organizers.detail.name', formattedName)}
      {formattedDescription &&
        renderOrganizerInfo(
          'organizers.detail.description',
          formattedDescription,
        )}
      {formattedEducationalDescription &&
        renderOrganizerInfo(
          'organizers.detail.educationalDescription',
          formattedEducationalDescription,
        )}
      {renderOrganizerInfo('organizers.detail.address', formattedAddress)}
      {renderOrganizerInfo(
        'organizers.detail.contact',
        formattedEmailAndPhone,
        organizer?.contactPoint?.url,
      )}
      {renderOrganizerLabels('organizers.detail.labels', organizer)}
      {renderOrganizerImages('organizers.detail.images', organizer?.images)}
    </Stack>
  );
};
