import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import i18n, { SupportedLanguage } from '@/i18n/index';
import { EmptyValue } from '@/pages/preview/EmptyValue';
import type {
  BookingAvailability,
  BookingInfo,
  Offer,
  SubEvent,
} from '@/types/Offer';
import type { Values } from '@/types/Values';
import { Inline } from '@/ui/Inline';
import { Link, LinkVariants } from '@/ui/Link';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { formatPeriod } from '@/utils/formatPeriod';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

const contactColumns = [
  { Header: 'Label', accessor: 'label' },
  { Header: 'Value', accessor: 'value' },
];

type ReservationCardProps = StackProps & {
  title?: string;
  url?: string;
  urlLabel?: BookingInfo['urlLabel'];
  capacity?: string;
  status?: Values<typeof BookingAvailabilityType>;
  showAvailability: boolean;
  mainLanguage?: string;
};

const ReservationCard = ({
  title,
  url,
  urlLabel,
  capacity,
  status,
  showAvailability,
  mainLanguage,
  ...boxProps
}: ReservationCardProps) => {
  const { t } = useTranslation();

  const urlLabelText = urlLabel
    ? getLanguageObjectOrFallback<string>(
        urlLabel,
        i18n.language as SupportedLanguage,
        mainLanguage as SupportedLanguage | undefined,
      )
    : undefined;

  const statusText =
    status !== BookingAvailabilityType.UNAVAILABLE
      ? t('bookingAvailability.available')
      : t('bookingAvailability.unavailable');

  return (
    <Stack
      spacing={4}
      padding={4}
      css={`
        border: 1px solid ${colors.grey3};
        border-radius: 0.5rem;
      `}
      {...getStackProps(boxProps)}
    >
      {title && <Text className="tw:font-bold">{title}</Text>}
      {url && (
        <Inline spacing={4} flexWrap="wrap">
          <Stack flex={1} spacing={1}>
            <Text className="tw:font-bold tw:text-udb-main-grey">
              {t('create.additionalInformation.booking_info.link')}
            </Text>
            <Link href={url}>{url}</Link>
          </Stack>
          {urlLabelText && (
            <Stack flex={1} spacing={1}>
              <Text className="tw:font-bold tw:text-udb-main-grey">
                {t(
                  'create.additionalInformation.booking_info.url_label_dropdown_label',
                )}
              </Text>
              <Link
                variant={LinkVariants.BUTTON_PRIMARY}
                href={url}
                target="_blank"
                alignSelf="flex-start"
              >
                {urlLabelText}
              </Link>
            </Stack>
          )}
        </Inline>
      )}
      {showAvailability && (
        <Inline spacing={4} flexWrap="wrap">
          {capacity && (
            <Stack flex={1} spacing={1}>
              <Text className="tw:font-bold tw:text-udb-main-grey">
                {t('create.additionalInformation.booking_info.max_capacity')}
              </Text>
              <Text>{capacity}</Text>
            </Stack>
          )}
          <Stack flex={1} spacing={1}>
            <Text className="tw:font-bold tw:text-udb-main-grey">
              {t('create.additionalInformation.booking_info.status')}
            </Text>
            <Text>{statusText}</Text>
          </Stack>
        </Inline>
      )}
    </Stack>
  );
};

type Props = {
  bookingInfo?: BookingInfo;
  subEvents: SubEvent[];
  mainLanguage?: Offer['mainLanguage'];
  canShowBookingAvailability: boolean;
};

const hasBookingAvailability = (bookingAvailability?: BookingAvailability) =>
  bookingAvailability !== undefined &&
  (bookingAvailability.capacity !== undefined ||
    bookingAvailability.type === BookingAvailabilityType.UNAVAILABLE);

const getCapacity = (bookingAvailability?: BookingAvailability) =>
  bookingAvailability?.capacity !== undefined
    ? String(bookingAvailability.capacity)
    : undefined;

const ReservationPreview = ({
  bookingInfo,
  subEvents,
  mainLanguage,
  canShowBookingAvailability,
}: Props) => {
  const { t } = useTranslation();

  const hasContactInfo = !!(bookingInfo?.phone || bookingInfo?.email);
  const hasLink = !!bookingInfo?.url;
  const isMultiple = subEvents.length > 1;

  const singleBookingAvailability = subEvents[0]?.bookingAvailability;

  const subEventsWithAvailability = subEvents.filter((subEvent) =>
    hasBookingAvailability(subEvent.bookingAvailability),
  );

  const showOfferAvailability =
    canShowBookingAvailability &&
    !isMultiple &&
    (hasLink || hasBookingAvailability(singleBookingAvailability));
  const showSubEventAvailability =
    canShowBookingAvailability &&
    isMultiple &&
    subEventsWithAvailability.length > 0;

  if (
    !hasContactInfo &&
    !hasLink &&
    !showOfferAvailability &&
    !showSubEventAvailability
  )
    return <EmptyValue>{t('preview.empty_value.booking')}</EmptyValue>;

  const contactRows = [
    bookingInfo?.email && {
      label: t('create.additionalInformation.booking_info.email'),
      value: (
        <Link href={`mailto:${bookingInfo.email}`}>{bookingInfo.email}</Link>
      ),
    },
    bookingInfo?.phone && {
      label: t('create.additionalInformation.booking_info.phone'),
      value: <Text>{bookingInfo.phone}</Text>,
    },
    bookingInfo?.availabilityStarts &&
      bookingInfo?.availabilityEnds && {
        label: t('preview.booking_period'),
        value: (
          <Text>
            {formatPeriod(
              bookingInfo.availabilityStarts,
              bookingInfo.availabilityEnds,
              i18n.language,
              t,
            )}
          </Text>
        ),
      },
  ].filter(Boolean);

  return (
    <Stack spacing={4}>
      {hasContactInfo && (
        <Table
          variant="preview"
          showHeader={false}
          columns={contactColumns}
          data={contactRows}
        />
      )}
      {(hasLink || showOfferAvailability) && (
        <ReservationCard
          url={bookingInfo?.url}
          urlLabel={bookingInfo?.urlLabel}
          capacity={getCapacity(singleBookingAvailability)}
          status={
            singleBookingAvailability?.type ?? BookingAvailabilityType.AVAILABLE
          }
          showAvailability={showOfferAvailability}
          mainLanguage={mainLanguage}
        />
      )}
      {showSubEventAvailability &&
        subEventsWithAvailability.map((subEvent, index) => (
          <ReservationCard
            key={index}
            title={`${format(new Date(subEvent.startDate), 'dd/MM/yyyy')} - ${format(new Date(subEvent.endDate), 'dd/MM/yyyy')}`}
            capacity={getCapacity(subEvent.bookingAvailability)}
            status={
              subEvent.bookingAvailability?.type ??
              BookingAvailabilityType.AVAILABLE
            }
            showAvailability
            mainLanguage={mainLanguage}
          />
        ))}
    </Stack>
  );
};

export { ReservationPreview };
