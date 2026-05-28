import { useTranslation } from 'react-i18next';

import i18n, { SupportedLanguage } from '@/i18n/index';
import { BookingInfo, Offer } from '@/types/Offer';
import { Link, LinkVariants } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { formatPeriod } from '@/utils/formatPeriod';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { PreviewTable } from './PreviewTable';

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
    <PreviewTable>
      {bookingInfo.email && (
        <tr>
          <td>{t('create.additionalInformation.booking_info.email')}</td>
          <td>
            <Link href={`mailto:${bookingInfo.email}`}>
              {bookingInfo.email}
            </Link>
          </td>
        </tr>
      )}
      {bookingInfo.phone && (
        <tr>
          <td>{t('create.additionalInformation.booking_info.phone')}</td>
          <td>
            <Text>{bookingInfo.phone}</Text>
          </td>
        </tr>
      )}
      {bookingInfo.url && (
        <tr>
          <td>{t('preview.booking_link_label')}</td>
          <td>
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
          </td>
        </tr>
      )}
      {bookingInfo.availabilityStarts && bookingInfo.availabilityEnds && (
        <tr>
          <td>{t('preview.booking_period')}</td>
          <td>
            <Text>
              {formatPeriod(
                bookingInfo.availabilityStarts,
                bookingInfo.availabilityEnds,
                i18n.language,
                t,
              )}
            </Text>
          </td>
        </tr>
      )}
    </PreviewTable>
  );
};

export { BookingInfoPreview };
