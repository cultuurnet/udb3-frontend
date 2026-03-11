import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { AddressInternal } from '@/types/Address';
import { hasOnlineLocation, Offer } from '@/types/Offer';
import { isPlace, Place } from '@/types/Place';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

import { getAddress } from '../create/OfferForm';

type Props = {
  offer: Offer;
};

const parseAddress = (
  offer: Place,
  language: SupportedLanguage,
  mainLanguage: SupportedLanguage,
) => {
  const { addressLocality, postalCode, streetAddress, addressCountry } =
    getAddress(offer.address, language, mainLanguage);

  return (
    <Stack>
      <span>{streetAddress}</span>
      <span>
        {postalCode} {addressLocality}
      </span>
      <span>{addressCountry}</span>
    </Stack>
  );
};

const LocationPreview = ({ offer }: Props) => {
  const { t } = useTranslation();

  if (isPlace(offer)) {
    const { mainLanguage } = offer;
    const placeAddress = parseAddress(
      offer,
      i18n.language as SupportedLanguage,
      mainLanguage,
    );
    return placeAddress;
  }

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

  return <Link href={`/place/${locationId}`}>{locationParts.join(', ')}</Link>;
};

export { LocationPreview };
