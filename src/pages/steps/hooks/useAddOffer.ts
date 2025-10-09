import getConfig from 'next/config';
import { useTranslation } from 'react-i18next';

import { AudienceTypes } from '@/constants/AudienceType';
import {
  CULTUURKUUR_EDUCATION_LABELS_ERROR,
  CULTUURKUUR_LOCATION_LABELS_ERROR,
  CULTUURKUUR_THEME_ERROR,
  CULTUURKUUR_TYPE_ERROR,
} from '@/constants/Cultuurkuur';
import { ErrorCodes } from '@/constants/ErrorCodes';
import { eventTypesWithNoThemes } from '@/constants/EventTypes';
import { OfferTypes, ScopeTypes } from '@/constants/OfferType';
import { useAddEventMutation } from '@/hooks/api/events';
import { useAddOfferLabelMutation } from '@/hooks/api/offers';
import { getPlacesByQuery, useAddPlaceMutation } from '@/hooks/api/places';
import {
  useAddEventByIdMutation as useAddEventToProductionByIdMutation,
  useCreateWithEventsMutation as useCreateProductionWithEventsMutation,
} from '@/hooks/api/productions';
import { useHeaders } from '@/hooks/api/useHeaders';
import { FormDataUnion } from '@/pages/steps/Steps';
import { Offer } from '@/types/Offer';
import {
  getEducationLabels,
  getLocationLabels,
} from '@/utils/cultuurkuurLabels';
import { FetchError } from '@/utils/fetchFromApi';

type UseAddOfferArgument = {
  onSuccess: (scope: FormDataUnion['scope'], offerId: string) => void;
  onError?: (error: FetchError) => void;
  convertFormDataToOffer: (data: any) => any;
  label?: string;
  initialOffer?: Offer;
};

const useAddOffer = ({
  onSuccess,
  onError,
  convertFormDataToOffer,
  label,
  initialOffer,
}: UseAddOfferArgument) => {
  const { i18n } = useTranslation();
  const { publicRuntimeConfig } = getConfig();
  const addEventMutation = useAddEventMutation();
  const addPlaceMutation = useAddPlaceMutation();
  const headers = useHeaders();
  const addLabelMutation = useAddOfferLabelMutation();

  const createProductionWithEventsMutation =
    useCreateProductionWithEventsMutation();
  const addEventToProductionByIdMutation =
    useAddEventToProductionByIdMutation();

  const CULTUURKUUR_LOCATION_ID = publicRuntimeConfig.cultuurKuurLocationId;

  return async (formData: FormDataUnion) => {
    const { scope, production } = formData;

    if (!production && !formData.nameAndAgeRange.name) return;

    const fullOffer = {
      ...initialOffer,
      ...formData,
    };

    const payload = convertFormDataToOffer(fullOffer);

    const isCultuurkuurEvent =
      payload.audience?.audienceType === AudienceTypes.EDUCATION;

    const errors = [];

    if (isCultuurkuurEvent) {
      const educationLabels = getEducationLabels(payload.labels);

      const locationLabels = getLocationLabels(payload.labels);

      const isThemeSelected = !!fullOffer?.typeAndTheme?.theme;

      const isTypeSelected = !!fullOffer?.typeAndTheme?.type;
      const selectedTypeId = fullOffer?.typeAndTheme?.type?.id;

      const hasTypeNoThemes =
        selectedTypeId && eventTypesWithNoThemes.includes(selectedTypeId);

      if (!educationLabels || educationLabels.length === 0) {
        errors.push(CULTUURKUUR_EDUCATION_LABELS_ERROR);
      }

      if (
        payload.location?.id === CULTUURKUUR_LOCATION_ID &&
        (!locationLabels || locationLabels.length === 0)
      ) {
        errors.push(CULTUURKUUR_LOCATION_LABELS_ERROR);
      }

      if (!isTypeSelected) {
        errors.push(CULTUURKUUR_TYPE_ERROR);
      }

      if (!isThemeSelected && !hasTypeNoThemes) {
        errors.push(CULTUURKUUR_THEME_ERROR);
      }
    }

    if (scope === ScopeTypes.PLACES) {
      const places = await getPlacesByQuery({
        headers,
        name: payload.name[i18n.language],
        terms: [],
        zip: payload.address[i18n.language].postalCode,
        streetAddress: payload.address[i18n.language].streetAddress,
        addressLocality: payload.address[i18n.language].addressLocality,
        addressCountry: payload.address[i18n.language].addressCountry,
      });
      if (places.totalItems > 0) {
        errors.push(ErrorCodes.DUPLICATE_PLACE_ERROR, places.member[0]['@id']);
      }
    }

    if (errors.length > 0) {
      onError?.(new FetchError(403, JSON.stringify(errors)));
      return;
    }

    const addOfferMutation =
      scope === OfferTypes.EVENTS ? addEventMutation : addPlaceMutation;

    try {
      const { eventId, placeId } = await addOfferMutation.mutateAsync(payload);
      const offerId: string = eventId || placeId;

      if (!offerId) return;

      if (label) {
        await addLabelMutation.mutateAsync({
          id: offerId,
          label,
          scope,
        });
      }

      if (!production) {
        onSuccess(scope, offerId);
        return;
      }

      if (production.customOption) {
        await createProductionWithEventsMutation.mutateAsync({
          productionName: production.name,
          eventIds: [offerId],
        });
      } else {
        await addEventToProductionByIdMutation.mutateAsync({
          productionId: production.production_id,
          eventId: offerId,
        });
      }

      onSuccess(scope, offerId);
    } catch (error) {
      onError?.(error);
    }
  };
};

export { useAddOffer };
