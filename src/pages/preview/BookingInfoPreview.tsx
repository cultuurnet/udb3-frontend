import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { BookingInfo, Offer } from '@/types/Offer';
import { Link, LinkVariants } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { formatPeriod } from '@/utils/formatPeriod';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

type Props = {
  bookingInfo: BookingInfo;
  mainLanguage?: Offer['mainLanguage'];
};

const BookingInfoPreview = ({ bookingInfo, mainLanguage }: Props) => {
  const { t } = useTranslation();

  const hasBookingInfo =
    bookingInfo && (bookingInfo.url || bookingInfo.phone || bookingInfo.email);

  if (!hasBookingInfo) {
    return (
      <Text className="empty-value">{t('preview.empty_value.booking')}</Text>
    );
  }

  const rows = [
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
    <table
      css={`
        width: 100%;

        td {
          padding-left: 0 !important;
          border-bottom: 1px solid ${colors.grey3};
        }
        tr:first-child td {
          padding-top: 0;
        }
        td:first-child {
          color: ${colors.grey5};
        }
        tr:last-child td {
          border-bottom: none;
        }
      `}
    >
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td>{row.label}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { BookingInfoPreview };
