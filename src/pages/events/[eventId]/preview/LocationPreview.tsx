import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { AddressInternal } from '@/types/Address';
import { hasOnlineLocation, Offer } from '@/types/Offer';
import { isPlace } from '@/types/Place';
import { Link } from '@/ui/Link';
import { Text } from '@/ui/Text';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

type Props = {
  offer: Offer;
};

const LocationPreview = ({ offer }: Props) => {
  const { t } = useTranslation();

  if (isPlace(offer)) return null;

  const { location, mainLanguage } = offer;

  const locationId = parseOfferId(location['@id']);

  if (hasOnlineLocation(offer)) {
    return <Text>{t('preview.online_label')}</Text>;
  }

  const locationName = getLanguageObjectOrFallback<string>(
    location.name,
    i18n.language as SupportedLanguage,
    mainLanguage,
  );

  if (location.isDummyPlaceForEducationEvents) {
    return <Text>{locationName}</Text>;
  }

  const addressForLang = getLanguageObjectOrFallback<AddressInternal>(
    location.address,
    i18n.language as SupportedLanguage,
    mainLanguage,
  );

  const locationParts = [
    locationName,
    ...(location.terms.length > 0
      ? [location.terms.find((term) => term.domain === 'eventtype')?.label]
      : []),
    addressForLang?.streetAddress,
    addressForLang?.addressLocality,
  ];

  return (
    <Link href={`/place/${locationId}/preview`}>
      {locationParts.join(', ')}
    </Link>
  );
};

export { LocationPreview };
