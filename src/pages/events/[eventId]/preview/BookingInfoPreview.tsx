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
    bookingInfo.url || bookingInfo.phone || bookingInfo.email;

  if (!hasBookingInfo) {
    return null;
  }

  return (
    <Stack spacing={3}>
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
      {bookingInfo.availabilityStarts && bookingInfo.availabilityEnds && (
        <Text>
          {formatPeriod(
            bookingInfo.availabilityStarts,
            bookingInfo.availabilityEnds,
            i18n.language,
            t,
          )}
        </Text>
      )}
    </Stack>
  );
};

export { BookingInfoPreview };
