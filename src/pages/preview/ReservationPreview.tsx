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
  url: string;
  urlLabel?: BookingInfo['urlLabel'];
  capacity?: string;
  status: Values<typeof BookingAvailabilityType>;
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
    status === BookingAvailabilityType.AVAILABLE
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
      {title && <Text fontWeight="bold">{title}</Text>}
      <Inline spacing={4} flexWrap="wrap">
        <Stack flex={1} spacing={1}>
          <Text color={colors.udbMainGrey} fontWeight="bold">
            {t('create.additionalInformation.booking_info.link')}
          </Text>
          <Text>{url}</Text>
        </Stack>
        {showAvailability && capacity && (
          <Stack flex={1} spacing={1}>
            <Text color={colors.udbMainGrey} fontWeight="bold">
              {t('create.additionalInformation.booking_info.max_capacity')}
            </Text>
            <Text>{capacity}</Text>
          </Stack>
        )}
      </Inline>
      <Inline spacing={4} flexWrap="wrap">
        {showAvailability && (
          <Stack flex={1} spacing={1}>
            <Text color={colors.udbMainGrey} fontWeight="bold">
              {t('create.additionalInformation.booking_info.status')}
            </Text>
            <Text>{statusText}</Text>
          </Stack>
        )}
        {urlLabelText && (
          <Stack flex={1} spacing={1}>
            <Text color={colors.udbMainGrey} fontWeight="bold">
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
    </Stack>
  );
};

type Props = {
  bookingInfo?: BookingInfo;
  bookingAvailability?: BookingAvailability;
  subEvents: SubEvent[];
  mainLanguage?: Offer['mainLanguage'];
  canShowBookingAvailability: boolean;
};

const ReservationPreview = ({
  bookingInfo,
  bookingAvailability,
  subEvents,
  mainLanguage,
  canShowBookingAvailability,
}: Props) => {
  const { t } = useTranslation();

  const subEventsWithUrl = subEvents.filter(
    (subEvent) => subEvent.bookingInfo?.url,
  );
  const hasContactInfo = !!(bookingInfo?.phone || bookingInfo?.email);
  const hasSingleDateUrl = !!bookingInfo?.url;
  const hasMultipleDateUrls = subEventsWithUrl.length > 0;

  if (!hasContactInfo && !hasSingleDateUrl && !hasMultipleDateUrls)
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
      {hasSingleDateUrl && (
        <ReservationCard
          url={bookingInfo!.url!}
          urlLabel={bookingInfo!.urlLabel}
          capacity={
            bookingAvailability?.capacity !== undefined
              ? String(bookingAvailability.capacity)
              : undefined
          }
          status={
            bookingAvailability?.type ?? BookingAvailabilityType.AVAILABLE
          }
          showAvailability={canShowBookingAvailability}
          mainLanguage={mainLanguage}
        />
      )}
      {hasMultipleDateUrls &&
        subEventsWithUrl.map((subEvent, index) => (
          <ReservationCard
            key={index}
            title={`${format(new Date(subEvent.startDate), 'dd/MM/yyyy')} - ${format(new Date(subEvent.endDate), 'dd/MM/yyyy')}`}
            url={subEvent.bookingInfo!.url!}
            urlLabel={subEvent.bookingInfo!.urlLabel}
            capacity={
              subEvent.bookingAvailability?.capacity !== undefined
                ? String(subEvent.bookingAvailability.capacity)
                : undefined
            }
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
