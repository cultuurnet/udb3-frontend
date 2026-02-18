import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { BookingInfo, Offer } from '@/types/Offer';
import { Link, LinkVariants } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
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

  return (
    <Stack spacing={3}>
      <Stack marginBottom={4} flexDirection="row" alignItems="stretch">
        <Stack width="50%">
          {hasBookingInfo && (
            <Text fontWeight="600" marginBottom={3}>
              {t('preview.booking_data')}
            </Text>
          )}
          {bookingInfo.email && (
            <Link href={`mailto:${bookingInfo.email}`}>
              {bookingInfo.email}
            </Link>
          )}
          {bookingInfo.phone && <Text>{bookingInfo.phone}</Text>}
          {bookingInfo.url && (
            <Link target="_blank" href={bookingInfo.url}>
              {bookingInfo.url}
            </Link>
          )}
        </Stack>
        {bookingInfo.url && (
          <Stack>
            <Text fontWeight="600" marginBottom={3}>
              {t('preview.booking_url')}
            </Text>
            <Link
              variant={LinkVariants.BUTTON_PRIMARY}
              target="_blank"
              href={bookingInfo.url}
            >
              {getLanguageObjectOrFallback(
                bookingInfo.urlLabel,
                i18n.language as SupportedLanguage,
                mainLanguage,
              )}
            </Link>
          </Stack>
        )}
      </Stack>
      {bookingInfo.availabilityStarts && bookingInfo.availabilityEnds && (
        <Stack>
          <Text fontWeight="600" marginBottom={3}>
            {t('preview.booking_period')}
          </Text>
          <Text>
            {formatPeriod(
              bookingInfo.availabilityStarts,
              bookingInfo.availabilityEnds,
              i18n.language,
              t,
            )}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};

export { BookingInfoPreview };
