import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { BookingInfo, Offer } from '@/types/Offer';
import { Inline } from '@/ui/Inline';
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
      <Stack marginBottom={4}>
        {hasBookingInfo && (
          <Text fontWeight="600">{t('preview.booking_data')}</Text>
        )}
        {bookingInfo.url && (
          <Inline>
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
          </Inline>
        )}
        {bookingInfo.phone && <Text>{bookingInfo.phone}</Text>}
        {bookingInfo.email && (
          <Link href={`mailto:${bookingInfo.email}`}>{bookingInfo.email}</Link>
        )}
      </Stack>
      {bookingInfo.availabilityStarts && bookingInfo.availabilityEnds && (
        <Stack spacing={1}>
          <Text fontWeight="600">{t('preview.booking_period')}</Text>
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
