import { ErrorCodes } from '@/constants/ErrorCodes';
import { getPlaceById, getPlacesByQuery } from '@/hooks/api/places';
import i18n from '@/i18n/index';
import { FormData } from '@/pages/create/OfferForm';
import { Address } from '@/types/Address';
import { CustomValidationError } from '@/utils/fetchFromApi';

import { parseOfferId } from './parseOfferId';

type Props = {
  headers: any;
  offerId: string;
  location: FormData['location'];
  name?: FormData['nameAndAgeRange']['name'];
};

export async function checkDuplicatePlace({
  headers,
  offerId,
  location,
  name,
}: Props) {
  const postalCode = ['NL', 'DE'].includes(location.country)
    ? location.postalCode
    : location.municipality.zip;

  const address: Address = {
    [i18n.language]: {
      streetAddress: location.streetAndNumber,
      addressCountry: location.country,
      addressLocality: location.municipality.name,
      postalCode,
    },
  };

  const place = await getPlaceById({ headers, id: offerId });

  const places = await getPlacesByQuery({
    headers,
    name: name?.[i18n.language] ?? place.name[i18n.language],
    terms: [],
    zip: address[i18n.language].postalCode,
    streetAddress: address[i18n.language].streetAddress,
    addressLocality: address[i18n.language].addressLocality,
    addressCountry: address[i18n.language].addressCountry,
    excludeId: offerId,
  });

  const placeId = parseOfferId(places?.member?.[0]?.['@id'] ?? '');

  if (places.totalItems > 0) {
    throw new CustomValidationError(ErrorCodes.DUPLICATE_PLACE_ERROR, {
      duplicatePlaceUri: placeId,
      type: !!name?.[i18n.language] ? 'NameAndAgeRange' : 'Location',
    });
  }

  return true;
}
