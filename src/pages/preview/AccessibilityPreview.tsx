import { useTranslation } from 'react-i18next';

import { OfferTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import type { SupportedLanguage } from '@/i18n/index';
import i18n from '@/i18n/index';
import type { AddressInternal } from '@/types/Address';
import { isPlace } from '@/types/Place';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

type DeparturePlaceAddressProps = {
  placeUri: string;
};

const DeparturePlaceAddress = ({ placeUri }: DeparturePlaceAddressProps) => {
  const { data: place } = useGetOfferByIdQuery({
    id: parseOfferId(placeUri),
    scope: OfferTypes.PLACES,
  });

  if (!isPlace(place)) return null;

  const address = getLanguageObjectOrFallback<AddressInternal>(
    place.address,
    i18n.language as SupportedLanguage,
    place.mainLanguage,
  );

  if (!address) return null;

  return (
    <Text>
      {address.streetAddress}, {address.postalCode} {address.addressLocality}
    </Text>
  );
};

type AccessibilityPreviewProps = {
  departurePlaces?: string[];
};

const AccessibilityPreview = ({
  departurePlaces,
}: AccessibilityPreviewProps) => {
  const { t } = useTranslation();

  if (!departurePlaces?.length) return null;

  return (
    <Stack spacing={2}>
      <Text color={colors.grey5}>{t('preview.accessibility.description')}</Text>
      <Stack spacing={1}>
        {departurePlaces.map((uri) => (
          <DeparturePlaceAddress key={uri} placeUri={uri} />
        ))}
      </Stack>
    </Stack>
  );
};

export { AccessibilityPreview };
