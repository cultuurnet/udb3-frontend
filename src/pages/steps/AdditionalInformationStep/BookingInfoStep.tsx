import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import {
  useAddOfferBookingInfoMutation,
  useGetOfferByIdQuery,
} from '@/hooks/api/offers';
import { Alert } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { TimeSpanPicker } from '@/ui/TimeSpanPicker';
import { Title } from '@/ui/Title';
import { formatDateToISO } from '@/utils/formatDateToISO';
import { isValidEmail, isValidPhone, isValidUrl } from '@/utils/isValidInfo';
import { prefixUrlWithHttps } from '@/utils/url';

import { TabContentProps, ValidationStatus } from './AdditionalInformationStep';

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

const getValue = getValueFromTheme('contactInformation');

const UrlLabelType = {
  BUY: 'buy',
  RESERVE: 'reserve',
  AVAILABILITY: 'availability',
  SUBSCRIBE: 'subscribe',
} as const;

const getUrlLabelType = (englishUrlLabel: string): string => {
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

type ReservationPeriodProps = {
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
}: ReservationPeriodProps) => {
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState(new Date());
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

  return (
    <Stack>
      <Inline>
        {!isDatePickerVisible && (
          <Stack>
            <Text fontWeight="bold" marginBottom={2}>
              {t(
                'create.additionalInformation.booking_info.reservation_period.title',
              )}
            </Text>
            <Button
              onClick={() => {
                setIsDatePickerVisible(true);
                setUserHasInteracted(true);
              }}
              variant={ButtonVariants.SECONDARY}
            >
              {t(
                'create.additionalInformation.booking_info.reservation_period.cta',
              )}
            </Button>
          </Stack>
        )}
      </Inline>
      {isDatePickerVisible && (
        <Stack
          borderRadius={getGlobalBorderRadius}
          padding={4}
          backgroundColor="white"
          css={`
            border: 1px solid ${getValue('borderColor')};
          `}
        >
          <Stack
            spacing={4}
            css={`
              position: relative;
            `}
          >
            <Button
              iconName={Icons.TRASH}
              variant={ButtonVariants.DANGER}
              onClick={() => {
                handleDelete();
                setIsDatePickerVisible(false);
              }}
              title={t(
                'create.additionalInformation.booking_info.reservation_period.delete',
              )}
              css={`
                position: absolute;
                right: 0;
                top: 0;
              `}
            />
            <Title size={3}>
              {t(
                'create.additionalInformation.booking_info.reservation_period.title',
              )}
            </Title>

            <Text>
              {t(
                'create.additionalInformation.booking_info.reservation_period.info_text',
              )}
            </Text>

            <DatePeriodPicker
              id="reservation-date-picker"
              dateStart={startDate}
              dateEnd={endDate}
              minDate={new Date()}
              onDateStartChange={(date) => {
                setStartDate(date);
                setUserHasInteracted(true);
              }}
              onDateEndChange={(date) => {
                setEndDate(date);
                setUserHasInteracted(true);
              }}
            />

            {hasTimeError && (
              <Alert variant="danger">
                {t(
                  'create.additionalInformation.booking_info.reservation_period.error.endDateTime_before_startDateTime',
                )}
              </Alert>
            )}

            <TimeSpanPicker
              id="reservation-time-picker"
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
              minWidth="120px"
              width="100%"
            />
          </Stack>
        </Stack>
      )}
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
  const [selectedUrlLabel, setSelectedUrlLabel] = useState('');
  const [hasInvalidUrl, setHasInvalidUrl] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const queryClient = useQueryClient();

  // TODO: refactor
  const eventId = offerId;

  const formComponent = useRef<HTMLFormElement>(null);

  const UrlLabelType = {
    BUY: 'buy',
    RESERVE: 'reserve',
    AVAILABILITY: 'availability',
    SUBSCRIBE: 'subscribe',
  } as const;

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
    {
      label: t(
        'create.additionalInformation.booking_info.url_type_labels.subscribe',
      ),
      value: UrlLabelType.SUBSCRIBE,
    },
  ];

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: offerId, scope });

  const bookingInfo = getOfferByIdQuery.data?.bookingInfo;

  const { register, handleSubmit, formState, control, setValue, getValues } =
    useForm<FormData>({
      mode: 'onBlur',
      resolver: yupResolver(schema),
      reValidateMode: 'onBlur',
      shouldFocusError: false,
    });

  useEffect(() => {
    if (!bookingInfo) return;

    const hasBookingInfo = Object.keys(bookingInfo).length > 0;

    onValidationChange(
      hasBookingInfo ? ValidationStatus.SUCCESS : ValidationStatus.NONE,
      field,
    );

    Object.values(ContactInfoType).map((type) => {
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
  }, [field, offerId, setValue, bookingInfo, onValidationChange]);

  useEffect(() => {
    if (!bookingInfo?.urlLabel?.en) return;

    if (bookingInfo.urlLabel.en) {
      const urlLabel = getUrlLabelType(bookingInfo.urlLabel.en);
      setSelectedUrlLabel(urlLabel);
    }
  }, [bookingInfo?.urlLabel?.en]);

  const [url, availabilityStarts, availabilityEnds] = useWatch({
    control,
    name: ['url', 'availabilityStarts', 'availabilityEnds'],
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
      URL_LABEL_TRANSLATIONS[selectedUrlLabel] ??
      URL_LABEL_TRANSLATIONS.reserve;

    if (bookingInfo.url) {
      bookingInfo.url = prefixUrlWithHttps(bookingInfo.url);
    }

    if (bookingInfo.url && !isValidUrl(bookingInfo.url)) {
      setHasInvalidUrl(true);
      return;
    } else {
      setHasInvalidUrl(false);
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

    if (
      !Object.keys(bookingInfo).some((key) =>
        ['phone', 'url', 'email'].includes(key),
      ) &&
      bookingInfo.availabilityEnds &&
      bookingInfo.availabilityStarts
    ) {
      delete bookingInfo.availabilityEnds;
      delete bookingInfo.availabilityStarts;
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
      availabilityEnds: isoEndDate,
      availabilityStarts: isoStartDate,
    });
  };

  const handleDeleteBookingPeriod = () => {
    const formValues = getValues();

    handleAddBookingInfoMutation({
      ...formValues,
      availabilityEnds: undefined,
      availabilityStarts: undefined,
    });
  };

  const handleOnUrlLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const urlLabelType = e.target.value;
    const newUrlLabels = URL_LABEL_TRANSLATIONS[urlLabelType];

    const formValues = getValues();

    handleAddBookingInfoMutation({
      ...formValues,
      urlLabel: newUrlLabels,
    });
  };

  return (
    <Stack maxWidth="55rem" {...getStackProps(props)}>
      <Inline justifyContent="space-between">
        <Stack
          as="form"
          width="45%"
          spacing={4}
          onBlur={() => handleAddBookingInfoMutation(getValues())}
          ref={formComponent}
        >
          {Object.keys(ContactInfoType).map((key, index) => {
            const type = ContactInfoType[key];
            return (
              <FormElement
                key={index}
                flex={2}
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
                  (formState.errors?.[type] &&
                    t(
                      `create.additionalInformation.booking_info.${type}_error`,
                    )) ||
                  (type === ContactInfoType.URL &&
                    hasInvalidUrl &&
                    t(`create.additionalInformation.booking_info.url_error`))
                }
              />
            );
          })}
          {url && (
            <Stack>
              <Text fontWeight="bold">
                {t(
                  'create.additionalInformation.booking_info.select_url_label',
                )}
              </Text>
              <RadioButtonGroup
                name="urlLabel"
                selected={selectedUrlLabel}
                items={URL_LABELS}
                onChange={(e) => {
                  setSelectedUrlLabel(e.target.value);
                  handleOnUrlLabelChange(e);
                }}
              />
            </Stack>
          )}
        </Stack>
        <Stack width="50%">
          <ReservationPeriod
            handlePeriodChange={handleChangeBookingPeriod}
            handleDelete={handleDeleteBookingPeriod}
            availabilityEnds={availabilityEnds}
            availabilityStarts={availabilityStarts}
            isDatePickerVisible={isDatePickerVisible}
            setIsDatePickerVisible={setIsDatePickerVisible}
          />
        </Stack>
      </Inline>
    </Stack>
  );
};

export { BookingInfoStep };
