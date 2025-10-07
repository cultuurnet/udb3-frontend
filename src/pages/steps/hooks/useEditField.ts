import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { OfferType } from '@/constants/OfferType';
import { SupportedLanguage } from '@/i18n/index';
import { useEditTypeAndTheme } from '@/pages/steps/EventTypeAndThemeStep';
import { useEditLocation } from '@/pages/steps/LocationStep';
import { useEditNameAndAgeRange } from '@/pages/steps/NameAndAgeRangeStep';
import { useEditNameAndProduction } from '@/pages/steps/ProductionStep';
import { FormDataUnion } from '@/pages/steps/Steps';
import { Offer } from '@/types/Offer';
import { CustomValidationError } from '@/utils/fetchFromApi';

import { useEditCalendar } from '../CalendarStep/CalendarStep';

type HandleSuccessOptions = {
  shouldInvalidateEvent?: boolean;
};

type UseEditArguments = {
  scope: OfferType;
  offerId: string;
  onSuccess: (editedField: string, options?: HandleSuccessOptions) => void;
  onError?: (error: CustomValidationError) => void;
  mainLanguage: SupportedLanguage;
};

const useEditField = ({ scope, onSuccess, offerId, handleSubmit, onError }) => {
  const queryClient = useQueryClient();
  const [fieldLoading, setFieldLoading] = useState<string>();
  const offer = queryClient.getQueryData<Offer>([scope, { id: offerId }]);

  const handleSuccess = (
    editedField: string,
    { shouldInvalidateEvent = true }: HandleSuccessOptions = {},
  ) => {
    onSuccess(editedField);

    if (!shouldInvalidateEvent) return;
    queryClient.invalidateQueries({ queryKey: [scope, { id: offerId }] });
  };

  const editArguments = {
    scope,
    offerId,
    onSuccess: handleSuccess,
    onError,
    mainLanguage: offer?.mainLanguage,
  };

  const editTypeAndTheme = useEditTypeAndTheme(editArguments);
  const editNameAndAgeRange = useEditNameAndAgeRange(editArguments);
  const editCalendar = useEditCalendar(editArguments);
  const editLocation = useEditLocation(editArguments);
  const editNameAndProduction = useEditNameAndProduction(editArguments);

  const handleChange = (editedField: string) => {
    if (!offerId) return;
    setFieldLoading(editedField);

    const editMap = {
      typeAndTheme: editTypeAndTheme,
      location: editLocation,
      nameAndAgeRange: editNameAndAgeRange,
      timeTable: editCalendar,
      calendar: editCalendar,
      production: editNameAndProduction,
    };

    const editEvent = editMap[editedField];

    handleSubmit(async (formData: FormDataUnion) => {
      try {
        await editEvent(formData, editedField);
      } catch (error) {
        onError?.(new CustomValidationError(error.message, error.body));
      }
    })();
  };

  return { handleChange, fieldLoading };
};

export type { UseEditArguments };
export { useEditField };
