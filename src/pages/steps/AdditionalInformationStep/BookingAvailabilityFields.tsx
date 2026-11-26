import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import type { Values } from '@/types/Values';
import type { BoxProps } from '@/ui/Box';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { isValidUrl } from '@/utils/isValidInfo';
import { prefixUrlWithHttps } from '@/utils/url';

type BookingAvailabilityValue = Values<typeof BookingAvailabilityType>;

type BookingAvailabilityFieldsProps = BoxProps & {
  idPrefix: string;
  status: BookingAvailabilityValue;
  waitingListUrl: string;
  onChangeBookingAvailability: (
    status: BookingAvailabilityValue,
    waitingListUrl?: string,
    onError?: () => void,
  ) => void;
};

const BookingAvailabilityFields = ({
  idPrefix,
  status: initialStatus,
  waitingListUrl: savedWaitingListUrl,
  onChangeBookingAvailability,
  ...boxProps
}: BookingAvailabilityFieldsProps) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState(initialStatus);
  const [waitingListUrl, setWaitingListUrl] = useState(savedWaitingListUrl);
  const [hasInvalidWaitingListUrl, setHasInvalidWaitingListUrl] =
    useState(false);

  const handleWaitingListUrlBlur = () => {
    const trimmedUrl = waitingListUrl.trim();
    const prefixedUrl = trimmedUrl === '' ? '' : prefixUrlWithHttps(trimmedUrl);

    if (prefixedUrl !== '' && !isValidUrl(prefixedUrl)) {
      setHasInvalidWaitingListUrl(true);
      return;
    }

    setHasInvalidWaitingListUrl(false);
    setWaitingListUrl(prefixedUrl);
    if (prefixedUrl === savedWaitingListUrl) return;
    onChangeBookingAvailability(status, prefixedUrl, () =>
      setHasInvalidWaitingListUrl(true),
    );
  };

  return (
    <Inline
      spacing={4}
      flexWrap="wrap"
      alignItems="flex-start"
      {...getInlineProps(boxProps)}
    >
      <FormElement
        id={`${idPrefix}-status`}
        label={t('create.additionalInformation.booking_info.status')}
        Component={
          <Select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value as BookingAvailabilityValue;
              setStatus(newStatus);
              onChangeBookingAvailability(newStatus);
            }}
          >
            <option value={BookingAvailabilityType.AVAILABLE}>
              {t('bookingAvailability.available')}
            </option>
            <option value={BookingAvailabilityType.UNAVAILABLE}>
              {t('bookingAvailability.unavailable')}
            </option>
          </Select>
        }
      />
      <FormElement
        className="tw:flex-1"
        id={`${idPrefix}-waiting-list-url`}
        label={t('create.additionalInformation.booking_info.waiting_list_url')}
        Component={
          <Input
            type="url"
            value={waitingListUrl}
            onChange={(e) => setWaitingListUrl(e.target.value)}
            onBlur={handleWaitingListUrlBlur}
          />
        }
        error={
          hasInvalidWaitingListUrl &&
          t('create.additionalInformation.booking_info.url_error')
        }
      />
    </Inline>
  );
};

export { BookingAvailabilityFields };
