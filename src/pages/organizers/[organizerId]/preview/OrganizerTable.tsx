import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';

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
} from '@/utils/formatOrganizerDetail';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { OrganizerLabelsForm } from './OrganizerLabels';

type VerenigingsloketProps = {
  vcode?: string;
};

type Props = { organizer: Organizer } & VerenigingsloketProps;

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

const Verenigingsloket = ({ vcode }: VerenigingsloketProps) => {
  const baseUrl = 'https://www.verenigingsloket.be';

  const detailUrl = `${baseUrl}/nl/verenigingen/${vcode}`;
  const previewUrl = detailUrl.replace('https://www.', '');

  return (
    <Inline
      padding={3}
      css={`
        border-top: 1px solid ${grey2};
      `}
    >
      <Text minWidth="15rem" color={udbMainDarkGrey}>
        Verenigingsloket
      </Text>
      <Stack spacing={3}>
        <Link href={detailUrl}>{previewUrl}</Link>
        <Text variant="muted">
          Dankzij deze koppeling verschijnen je activiteiten automatisch ook op
          je publieke profiel in het verenigingsloket.{' '}
          {/* TODO add link to helpdesk page */}
          <Link href={'#'}>Lees meer</Link>
        </Text>
      </Stack>
    </Inline>
  );
};

export const OrganizerTable = ({ organizer, vcode }: Props) => {
  const { i18n } = useTranslation();

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
      {vcode && <Verenigingsloket vcode={vcode} />}
    </Stack>
  );
};
