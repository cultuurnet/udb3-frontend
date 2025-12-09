import i18n, { SupportedLanguage } from '@/i18n/index';
import { AddressInternal } from '@/types/Address';
import { Offer } from '@/types/Offer';
import { isPlace } from '@/types/Place';
import { Link } from '@/ui/Link';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

type Props = {
  offer: Offer;
};

const LocationPreview = ({ offer }: Props) => {
  if (isPlace(offer)) return null;

  const { location, mainLanguage } = offer;

  const locationId = parseOfferId(location['@id']);

  const locationName = getLanguageObjectOrFallback<string>(
    location.name,
    i18n.language as SupportedLanguage,
    mainLanguage,
  );

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
