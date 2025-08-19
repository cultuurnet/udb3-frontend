import { Trans, useTranslation } from 'react-i18next';

import { OfferTypes } from '@/constants/OfferType';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Link } from '@/ui/Link';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { SupportedLanguage } from '../i18n';

type Props = {
  variant: Values<typeof AlertVariants>;
  placeId?: string;
  query?: string;
  offerId?: string;
  labelKey: string;
};

const AlertDuplicatePlace = ({
  variant,
  placeId,
  query,
  offerId,
  labelKey,
}: Props) => {
  const { t, i18n } = useTranslation();

  const getPlaceByIdQuery = useGetPlaceByIdQuery({
    id: placeId,
    scope: OfferTypes.PLACES,
  });

  if (query) {
    return (
      <Alert variant={variant}>
        {t('location.add_modal.errors.duplicate_place_generic')}
      </Alert>
    );
  }

  if (!placeId) {
    return null;
  }

  const duplicatePlace = getPlaceByIdQuery.data;

  const duplicatePlaceName = duplicatePlace
    ? getLanguageObjectOrFallback(
        duplicatePlace?.name,
        i18n.language as SupportedLanguage,
        duplicatePlace?.mainLanguage,
      )
    : undefined;

  return (
    <Alert variant={variant} maxWidth="50rem">
      {offerId ? (
        <Trans
          i18nKey={labelKey}
          components={{
            placeLink: (
              <Link
                href={`/place/${placeId}/preview`}
                display={'inline-block'}
                fontWeight={'bold'}
                textDecoration={'underline'}
                padding={0}
              />
            ),
          }}
        />
      ) : (
        <Trans
          i18nKey={labelKey}
          values={{
            placeName: duplicatePlaceName,
          }}
          components={{
            placeLink: (
              <Link
                href={`/place/${placeId}/preview`}
                display={'inline-block'}
                fontWeight={'bold'}
                textDecoration={'underline'}
                padding={0}
              />
            ),
          }}
        />
      )}
    </Alert>
  );
};

export { AlertDuplicatePlace };
