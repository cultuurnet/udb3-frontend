import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { BookingInfo, Offer } from '@/types/Offer';
import { Link, LinkVariants } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { formatPeriod } from '@/utils/formatPeriod';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

type Props = {
  bookingInfo: BookingInfo;
  mainLanguage?: Offer['mainLanguage'];
};

const columns = [
  { Header: 'Label', accessor: 'label' },
  { Header: 'Value', accessor: 'value' },
];

const BookingInfoPreview = ({ bookingInfo, mainLanguage }: Props) => {
  const { t } = useTranslation();

  const hasBookingInfo =
    bookingInfo && (bookingInfo.url || bookingInfo.phone || bookingInfo.email);

  if (!hasBookingInfo) {
    return (
      <Text className="empty-value">{t('preview.empty_value.booking')}</Text>
    );
  }

  const data = [
    bookingInfo.email && {
      label: t('create.additionalInformation.booking_info.email'),
      value: (
        <Link href={`mailto:${bookingInfo.email}`}>{bookingInfo.email}</Link>
      ),
    },
    bookingInfo.phone && {
      label: t('create.additionalInformation.booking_info.phone'),
      value: <Text>{bookingInfo.phone}</Text>,
    },
    bookingInfo.url && {
      label: t('preview.booking_link_label'),
      value: (
        <Stack spacing={2}>
          <Link target="_blank" href={bookingInfo.url}>
            {bookingInfo.url}
          </Link>
          <Link
            variant={LinkVariants.BUTTON_PRIMARY}
            target="_blank"
            href={bookingInfo.url}
            alignSelf="flex-start"
          >
            {getLanguageObjectOrFallback(
              bookingInfo.urlLabel,
              i18n.language as SupportedLanguage,
              mainLanguage,
            )}
          </Link>
        </Stack>
      ),
    },
    bookingInfo.availabilityStarts &&
      bookingInfo.availabilityEnds && {
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
    <Table variant="preview" showHeader={false} columns={columns} data={data} />
  );
};

export { BookingInfoPreview };
