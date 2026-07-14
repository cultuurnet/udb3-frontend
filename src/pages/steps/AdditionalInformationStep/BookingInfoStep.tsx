import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { CalendarType } from '@/constants/CalendarType';
import { UrlLabelType } from '@/constants/UrlLabelType';
import { useChangeSubEventReservationMutation } from '@/hooks/api/events';
import { useHolidaysWithToggle } from '@/hooks/api/holidays';
import {
  useAddOfferBookingInfoMutation,
  useGetOfferByIdQuery,
} from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Offer, SubEvent } from '@/types/Offer';
import type { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import type { BoxProps } from '@/ui/Box';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { RadioButtonTypes } from '@/ui/RadioButton';
import { RadioButtonWithLabel } from '@/ui/RadioButtonWithLabel';
import { Select } from '@/ui/Select';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { TimeSpanPicker } from '@/ui/TimeSpanPicker';
import { formatDateToISO } from '@/utils/formatDateToISO';
import { isValidEmail, isValidPhone, isValidUrl } from '@/utils/isValidInfo';
import { prefixUrlWithHttps } from '@/utils/url';

import { TabContentProps, ValidationStatus } from './AdditionalInformationStep';
import { BookingAvailabilityFields } from './BookingAvailabilityFields';

const schema = yup
  .object({
    availabilityEnds: yup.string(),
    availabilityStarts: yup.string(),
    email: yup
      .string()
      .test(`email-is-not-valid`, 'email is not valid', isValidEmail),
    phone: yup
      .string()
      .test(`phone-is-not-valid`, 'phone is not valid', isValidPhone),
    url: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const urlLabelTranslationString =
  'create.additionalInformation.booking_info.url_type_labels';

const SUBTITLE_COLOR = colors.udbMainDarkBlue;

const ContactInfoType = {
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',
} as const;

type BookingInfo = {
  email?: string;
  phone?: string;
  url?: string;
  urlLabel?: {
    de: string;
    en: string;
    fr: string;
    nl: string;
  };
  availabilityStarts?: string;
  availabilityEnds?: string;
};

const getUrlLabelType = (
  englishUrlLabel: string,
): Values<typeof UrlLabelType> => {
  if (englishUrlLabel.toLowerCase().includes(UrlLabelType.AVAILABILITY))
    return UrlLabelType.AVAILABILITY;

  if (englishUrlLabel.toLowerCase().includes(UrlLabelType.BUY))
    return UrlLabelType.BUY;

  if (englishUrlLabel.toLowerCase().includes(UrlLabelType.SUBSCRIBE))
    return UrlLabelType.SUBSCRIBE;

  if (englishUrlLabel.toLowerCase().includes(UrlLabelType.RESERVE))
    return UrlLabelType.RESERVE;

  return UrlLabelType.BUY;
};

type ReservationPeriodProps = StackProps & {
  availabilityStarts: string;
  availabilityEnds: string;
  handleDelete: () => void;
  handlePeriodChange: (
    availabilityEnds: Date,
    availabilityStarts: Date,
  ) => void;
  isDatePickerVisible: boolean;
  setIsDatePickerVisible: (isVisible: boolean) => void;
};

const ReservationPeriod = ({
  availabilityEnds,
  availabilityStarts,
  handleDelete,
  handlePeriodChange,
  isDatePickerVisible,
  setIsDatePickerVisible,
  ...props
}: ReservationPeriodProps) => {
  const { t } = useTranslation();
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  const [startDate, setStartDate] = useState(new Date());
  const { apiHolidays, onShowHolidaysChange } = useHolidaysWithToggle();
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  const [isPeriodInitialized, setIsPeriodInitialized] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const [hasTimeError, setHasTimeError] = useState(false);

  useEffect(() => {
    if (!availabilityEnds || !availabilityStarts) {
      return;
    }

    if (isPeriodInitialized) return;

    setIsDatePickerVisible(true);

    const startDateTime = new Date(availabilityStarts);
    const endDateTime = new Date(availabilityEnds);

    setStartDate(startDateTime);
    setEndDate(endDateTime);

    setStartTime(startDateTime.toTimeString().slice(0, 5));
    setEndTime(endDateTime.toTimeString().slice(0, 5));

    setIsPeriodInitialized(true);
  }, [
    availabilityEnds,
    availabilityStarts,
    isPeriodInitialized,
    setIsDatePickerVisible,
  ]);

  useEffect(() => {
    if (!userHasInteracted) return;
    if (!isDatePickerVisible || !startDate || !endDate) return;
    if (endDate < startDate) return;

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endDateTime < startDateTime) {
      setHasTimeError(true);
      setUserHasInteracted(false);
      return;
    } else {
      setHasTimeError(false);
    }

    handlePeriodChange(endDateTime, startDateTime);

    setUserHasInteracted(false);
  }, [
    startDate,
    endDate,
    startTime,
    endTime,
    userHasInteracted,
    isDatePickerVisible,
    handlePeriodChange,
  ]);

  const handleToggle = (isEnabled: boolean) => {
    if (isEnabled) {
      setIsDatePickerVisible(true);
      setUserHasInteracted(true);
      return;
    }

    handleDelete();
    setIsDatePickerVisible(false);
  };

  return (
    <Stack spacing={4} {...getStackProps(props)}>
      <Text fontWeight="bold" fontSize="1.1rem" color={SUBTITLE_COLOR}>
        {t(
          'create.additionalInformation.booking_info.reservation_period.title',
        )}
      </Text>
      <RadioButtonWithLabel
        id="reservation-period-toggle"
        type={RadioButtonTypes.SWITCH}
        label={t(
          'create.additionalInformation.booking_info.reservation_period.toggle',
        )}
        checked={isDatePickerVisible}
        onChange={(e) => handleToggle(e.target.checked)}
        color={colors.udbMainPositiveGreen}
      />
      {hasTimeError && (
        <Alert variant="danger">
          {t(
            'create.additionalInformation.booking_info.reservation_period.error.endDateTime_before_startDateTime',
          )}
        </Alert>
      )}
      <Inline
        spacing={0}
        alignItems="flex-end"
        flexWrap="wrap"
        className="tw:gap-4"
        opacity={isDatePickerVisible ? 1 : 0.5}
      >
        <DatePeriodPicker
          showHolidaysToggle={isBoaEnabled}
          id="reservation-date-picker"
          dateStart={startDate}
          dateEnd={endDate}
          minDate={new Date()}
          disabled={!isDatePickerVisible}
          onDateStartChange={(date) => {
            setStartDate(date);
            setUserHasInteracted(true);
          }}
          onDateEndChange={(date) => {
            setEndDate(date);
            setUserHasInteracted(true);
          }}
          apiHolidays={apiHolidays}
          onShowHolidaysChange={onShowHolidaysChange}
        />
        <TimeSpanPicker
          id="reservation-time-picker"
          disabled={!isDatePickerVisible}
          startTime={startTime}
          endTime={endTime}
          startTimeLabel={t(
            'create.additionalInformation.booking_info.reservation_period.startHour',
          )}
          endTimeLabel={t(
            'create.additionalInformation.booking_info.reservation_period.endHour',
          )}
          onChangeStartTime={(time) => {
            setStartTime(time);
            setUserHasInteracted(true);
          }}
          onChangeEndTime={(time) => {
            setEndTime(time);
            setUserHasInteracted(true);
          }}
          className="tw:min-w-30"
        />
      </Inline>
    </Stack>
  );
};

type BookingAvailabilitySectionProps = {
  calendarType: Offer['calendarType'] | undefined;
  subEvents: SubEvent[];
  onChangeSubEventAvailability: (
    index: number,
    type: Values<typeof BookingAvailabilityType>,
    capacity: string,
  ) => void;
};

type UrlLabelValue = Values<typeof UrlLabelType> | '';

type UrlLabelOption = { label: string; value: UrlLabelValue };

type ReservationLinkProps = BoxProps & {
  idPrefix: string;
  url: string;
  urlLabel: UrlLabelValue;
  urlLabelOptions: UrlLabelOption[];
  onChangeBookingInfo: (url: string, urlLabel: UrlLabelValue) => void;
};

const ReservationLink = ({
  idPrefix,
  url: initialUrl,
  urlLabel: initialUrlLabel,
  urlLabelOptions,
  onChangeBookingInfo,
  ...boxProps
}: ReservationLinkProps) => {
  const { t } = useTranslation();

  const [url, setUrl] = useState(initialUrl);
  const [urlLabel, setUrlLabel] = useState(initialUrlLabel);
  const [hasInvalidUrl, setHasInvalidUrl] = useState(false);

  const handleUrlBlur = () => {
    if (url === '') {
      setHasInvalidUrl(false);
      onChangeBookingInfo('', urlLabel);
      return;
    }

    const prefixedUrl = prefixUrlWithHttps(url);

    if (!isValidUrl(prefixedUrl)) {
      setHasInvalidUrl(true);
      return;
    }

    setHasInvalidUrl(false);
    setUrl(prefixedUrl);
    onChangeBookingInfo(prefixedUrl, urlLabel);
  };

  return (
    <Inline spacing={4} flexWrap="wrap" {...getInlineProps(boxProps)}>
      <FormElement
        flex={1}
        id={`${idPrefix}-link`}
        label={t('create.additionalInformation.booking_info.link')}
        Component={
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
          />
        }
        error={
          hasInvalidUrl &&
          t('create.additionalInformation.booking_info.url_error')
        }
      />
      <FormElement
        flex={1}
        id={`${idPrefix}-url-label`}
        label={t(
          'create.additionalInformation.booking_info.url_label_dropdown_label',
        )}
        Component={
          <Select
            value={urlLabel}
            onChange={(e) => {
              const newUrlLabel = e.target.value as UrlLabelValue;
              setUrlLabel(newUrlLabel);
              onChangeBookingInfo(url, newUrlLabel);
            }}
          >
            {urlLabelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />
    </Inline>
  );
};

const CapacityInfoAlert = () => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3} maxWidth="27rem">
      <Alert variant={AlertVariants.PRIMARY} fullWidth>
        {t('create.additionalInformation.booking_info.max_capacity_info')}
      </Alert>
    </Stack>
  );
};

const getCapacityValue = (
  bookingAvailability: SubEvent['bookingAvailability'],
) =>
  bookingAvailability?.capacity !== undefined
    ? String(bookingAvailability.capacity)
    : '';

const BookingAvailabilitySection = ({
  calendarType,
  subEvents,
  onChangeSubEventAvailability,
}: BookingAvailabilitySectionProps) => {
  const { t } = useTranslation();

  const isMultiple = calendarType === CalendarType.MULTIPLE;

  return (
    <Stack spacing={4}>
      <Text fontWeight="bold" fontSize="1.1rem" color={SUBTITLE_COLOR}>
        {t(
          isMultiple
            ? 'create.additionalInformation.booking_info.capacity_title_multiple'
            : 'create.additionalInformation.booking_info.capacity_title_single',
        )}
      </Text>
      <Inline stackOn="m" alignItems="flex-start" spacing={4}>
        <Stack spacing={3} minWidth="30rem">
          {subEvents.map((subEvent, index) => (
            <Stack key={`${subEvent.startDate}-${index}`} spacing={2}>
              {isMultiple && (
                <Text fontWeight="bold" color={SUBTITLE_COLOR}>
                  {`${format(new Date(subEvent.startDate), 'dd/MM/yyyy')} - ${format(new Date(subEvent.endDate), 'dd/MM/yyyy')}`}
                </Text>
              )}
              <BookingAvailabilityFields
                idPrefix={isMultiple ? `subevent-${index}` : 'offer'}
                capacity={getCapacityValue(subEvent.bookingAvailability)}
                status={
                  subEvent.bookingAvailability?.type ??
                  BookingAvailabilityType.AVAILABLE
                }
                onChangeBookingAvailability={(type, capacityValue) =>
                  onChangeSubEventAvailability(index, type, capacityValue)
                }
              />
            </Stack>
          ))}
        </Stack>
        <CapacityInfoAlert />
      </Inline>
    </Stack>
  );
};

type Props = StackProps & TabContentProps;

const BookingInfoStep = ({
  scope,
  field,
  offerId,
  onSuccessfulChange,
  onValidationChange,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);
  const [selectedUrlLabel, setSelectedUrlLabel] = useState('');
  const [offerUrl, setOfferUrl] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const queryClient = useQueryClient();

  const eventId = offerId;

  const formComponent = useRef<HTMLFormElement>(null);

  const URL_LABEL_TRANSLATIONS = {
    buy: {
      nl: t(`${urlLabelTranslationString}.buy`, { lng: 'nl' }),
      fr: t(`${urlLabelTranslationString}.buy`, { lng: 'fr' }),
      en: 'Buy tickets',
      de: t(`${urlLabelTranslationString}.buy`, { lng: 'de' }),
    },
    availability: {
      nl: t(`${urlLabelTranslationString}.availability`, { lng: 'nl' }),
      fr: t(`${urlLabelTranslationString}.availability`, { lng: 'fr' }),
      en: 'Check availability',
      de: t(`${urlLabelTranslationString}.availability`, { lng: 'de' }),
    },
    subscribe: {
      nl: t(`${urlLabelTranslationString}.subscribe`, { lng: 'nl' }),
      fr: t(`${urlLabelTranslationString}.subscribe`, { lng: 'fr' }),
      en: 'Subscribe',
      de: t(`${urlLabelTranslationString}.subscribe`, { lng: 'de' }),
    },
    reserve: {
      nl: t(`${urlLabelTranslationString}.reserve`, { lng: 'nl' }),
      fr: t(`${urlLabelTranslationString}.reserve`, { lng: 'fr' }),
      en: 'Reserve places',
      de: t(`${urlLabelTranslationString}.reserve`, { lng: 'de' }),
    },
  };

  const URL_LABELS = [
    {
      label: t(
        'create.additionalInformation.booking_info.url_type_labels.subscribe',
      ),
      value: UrlLabelType.SUBSCRIBE,
    },
    {
      label: t('create.additionalInformation.booking_info.url_type_labels.buy'),
      value: UrlLabelType.BUY,
    },
    {
      label: t(
        'create.additionalInformation.booking_info.url_type_labels.reserve',
      ),
      value: UrlLabelType.RESERVE,
    },
    {
      label: t(
        'create.additionalInformation.booking_info.url_type_labels.availability',
      ),
      value: UrlLabelType.AVAILABILITY,
    },
  ];

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: offerId, scope });

  const bookingInfo = getOfferByIdQuery.data?.bookingInfo;
  const subEvents = getOfferByIdQuery.data?.subEvent ?? [];
  const calendarType = getOfferByIdQuery.data?.calendarType;
  const canEditBookingAvailability =
    calendarType === CalendarType.SINGLE ||
    calendarType === CalendarType.MULTIPLE;

  const { register, handleSubmit, formState, control, setValue, getValues } =
    useForm<FormData>({
      mode: 'onBlur',
      resolver: yupResolver(schema),
      reValidateMode: 'onBlur',
      shouldFocusError: false,
    });

  useEffect(() => {
    const hasOfferBookingInfo =
      !!bookingInfo && Object.keys(bookingInfo).length > 0;
    const hasSubEventReservation = (
      getOfferByIdQuery.data?.subEvent ?? []
    ).some(
      (subEvent) =>
        !!subEvent.bookingInfo?.url ||
        subEvent.bookingAvailability?.capacity !== undefined,
    );

    onValidationChange(
      hasOfferBookingInfo || hasSubEventReservation
        ? ValidationStatus.SUCCESS
        : ValidationStatus.NONE,
      field,
    );

    if (!bookingInfo) return;

    if (bookingInfo.url) {
      setOfferUrl(bookingInfo.url);
    }

    Object.values(ContactInfoType)
      .filter((type) => type !== ContactInfoType.URL)
      .forEach((type) => {
        if (bookingInfo?.[type]) {
          setValue(type, bookingInfo[type]);
        }
      });

    if (bookingInfo.availabilityStarts) {
      setValue('availabilityStarts', bookingInfo.availabilityStarts);
    }

    if (bookingInfo.availabilityEnds) {
      setValue('availabilityEnds', bookingInfo.availabilityEnds);
    }
  }, [
    field,
    offerId,
    setValue,
    bookingInfo,
    getOfferByIdQuery.data?.subEvent,
    onValidationChange,
  ]);

  useEffect(() => {
    if (!bookingInfo?.urlLabel?.en) return;

    if (bookingInfo.urlLabel.en) {
      const urlLabel = getUrlLabelType(bookingInfo.urlLabel.en);
      setSelectedUrlLabel(urlLabel);
    }
  }, [bookingInfo?.urlLabel?.en]);

  const [availabilityStarts, availabilityEnds] = useWatch({
    control,
    name: ['availabilityStarts', 'availabilityEnds'],
  });

  const addBookingInfoMutation = useAddOfferBookingInfoMutation({
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({
        queryKey: [scope, { id: eventId }],
      });

      const previousEventInfo: any = queryClient.getQueryData([
        scope,
        { id: eventId },
      ]);

      queryClient.setQueryData([scope, { id: eventId }], () => {
        return { ...previousEventInfo, bookingInfo: newPayload.bookingInfo };
      });

      return { previousEventInfo };
    },
    onError: (_err, _newBookingInfo, context) => {
      queryClient.setQueryData(
        ['events', { id: eventId }],
        context.previousEventInfo,
      );
    },
    onSuccess: onSuccessfulChange,
  });

  const handleAddBookingInfoMutation = (newBookingInfo: BookingInfo) => {
    const bookingInfo = newBookingInfo;
    const newUrlLabels =
      bookingInfo.urlLabel ??
      URL_LABEL_TRANSLATIONS[selectedUrlLabel] ??
      URL_LABEL_TRANSLATIONS.reserve;

    if (bookingInfo.url) {
      bookingInfo.url = prefixUrlWithHttps(bookingInfo.url);
    }

    if (bookingInfo.url && !isValidUrl(bookingInfo.url)) {
      return;
    }

    if (bookingInfo.url === '') {
      delete bookingInfo.urlLabel;
      delete bookingInfo.url;
    }

    if (bookingInfo.phone === '') {
      delete bookingInfo.phone;
    }

    if (bookingInfo.email === '') {
      delete bookingInfo.email;
    }

    if (!isDatePickerVisible) {
      delete bookingInfo.availabilityEnds;
      delete bookingInfo.availabilityStarts;
    }

    addBookingInfoMutation.mutate({
      eventId,
      bookingInfo: {
        ...bookingInfo,
        ...('url' in bookingInfo && {
          urlLabel: newUrlLabels,
        }),
      },
      scope,
    });
  };

  const changeSubEventReservationMutation =
    useChangeSubEventReservationMutation({
      onMutate: async ({ subEventIndex, bookingInfo, bookingAvailability }) => {
        const queryKey = [scope, { id: eventId }];
        await queryClient.cancelQueries({ queryKey });
        const previousOffer = queryClient.getQueryData<Offer>(queryKey);

        queryClient.setQueryData<Offer>(queryKey, (offer) => {
          if (!offer?.subEvent) return offer;
          return {
            ...offer,
            subEvent: offer.subEvent.map((subEvent, index) =>
              index === subEventIndex
                ? {
                    ...subEvent,
                    ...(bookingInfo !== undefined && { bookingInfo }),
                    ...(bookingAvailability && { bookingAvailability }),
                  }
                : subEvent,
            ),
          };
        });

        return { previousOffer };
      },
      onError: (
        _error,
        _variables,
        context: { previousOffer?: Offer } | undefined,
      ) => {
        if (context?.previousOffer) {
          queryClient.setQueryData<Offer>(
            [scope, { id: eventId }],
            context.previousOffer,
          );
        }
      },
      onSuccess: onSuccessfulChange,
    });

  const handleChangeSubEventAvailability = (
    subEventIndex: number,
    type: Values<typeof BookingAvailabilityType>,
    capacityValue: string,
  ) => {
    changeSubEventReservationMutation.mutate({
      eventId,
      subEventIndex,
      bookingAvailability: {
        type,
        ...(capacityValue !== '' && { capacity: Number(capacityValue) }),
      },
    });
  };

  const handleChangeOfferBookingInfo = (url: string, urlLabelType: string) => {
    setOfferUrl(url);
    setSelectedUrlLabel(urlLabelType);

    handleAddBookingInfoMutation({
      ...getValues(),
      url,
      urlLabel:
        URL_LABEL_TRANSLATIONS[urlLabelType] ?? URL_LABEL_TRANSLATIONS.reserve,
    });
  };

  const handleChangeBookingPeriod = (
    availabilityEnds: Date,
    availabilityStarts: Date,
  ) => {
    const isoEndDate = formatDateToISO(availabilityEnds);
    const isoStartDate = formatDateToISO(availabilityStarts);

    setValue('availabilityEnds', isoEndDate);
    setValue('availabilityStarts', isoStartDate);

    const formValues = getValues();

    handleAddBookingInfoMutation({
      ...formValues,
      url: offerUrl,
      availabilityEnds: isoEndDate,
      availabilityStarts: isoStartDate,
    });
  };

  const handleDeleteBookingPeriod = () => {
    const formValues = getValues();

    handleAddBookingInfoMutation({
      ...formValues,
      url: offerUrl,
      availabilityEnds: undefined,
      availabilityStarts: undefined,
    });
  };

  return (
    <Stack maxWidth="75rem" spacing={5} {...getStackProps(props)}>
      <Text fontWeight="bold" fontSize="1.1rem">
        {t('create.additionalInformation.booking_info.section_title')}
      </Text>
      <Stack
        as="form"
        spacing={4}
        onBlur={() =>
          handleAddBookingInfoMutation({ ...getValues(), url: offerUrl })
        }
        ref={formComponent}
      >
        <Text fontWeight="bold" fontSize="1.1rem" color={SUBTITLE_COLOR}>
          {t('create.additionalInformation.booking_info.contact_details')}
        </Text>
        <Inline spacing={4} flexWrap="wrap" maxWidth="38rem">
          {Object.keys(ContactInfoType)
            .map((key) => ContactInfoType[key])
            .filter((type) => type !== ContactInfoType.URL)
            .map((type) => (
              <FormElement
                key={type}
                flex={1}
                id={type}
                label={t(`create.additionalInformation.booking_info.${type}`)}
                Component={
                  <Input
                    placeholder={t(
                      `create.additionalInformation.booking_info.${type}`,
                    )}
                    {...register(type)}
                  />
                }
                error={
                  formState.errors?.[type] &&
                  t(`create.additionalInformation.booking_info.${type}_error`)
                }
              />
            ))}
        </Inline>
      </Stack>
      <ReservationPeriod
        handlePeriodChange={handleChangeBookingPeriod}
        handleDelete={handleDeleteBookingPeriod}
        availabilityEnds={availabilityEnds}
        availabilityStarts={availabilityStarts}
        isDatePickerVisible={isDatePickerVisible}
        setIsDatePickerVisible={setIsDatePickerVisible}
      />
      <Stack spacing={4}>
        <Text fontWeight="bold" fontSize="1.1rem" color={SUBTITLE_COLOR}>
          {t('create.additionalInformation.booking_info.url')}
        </Text>
        {getOfferByIdQuery.data && (
          <ReservationLink
            idPrefix="offer"
            maxWidth="46rem"
            url={bookingInfo?.url ?? ''}
            urlLabel={
              bookingInfo?.urlLabel?.en
                ? getUrlLabelType(bookingInfo.urlLabel.en)
                : ''
            }
            urlLabelOptions={URL_LABELS}
            onChangeBookingInfo={handleChangeOfferBookingInfo}
          />
        )}
      </Stack>
      {isBoaEnabled && canEditBookingAvailability && getOfferByIdQuery.data && (
        <BookingAvailabilitySection
          calendarType={calendarType}
          subEvents={subEvents}
          onChangeSubEventAvailability={handleChangeSubEventAvailability}
        />
      )}
    </Stack>
  );
};

export { BookingInfoStep };
