import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { IS_CAPACITY_VISIBLE } from '@/constants/Capacity';
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
  capacity: string;
  status: BookingAvailabilityValue;
  waitingListUrl: string;
  onChangeBookingAvailability: (
    status: BookingAvailabilityValue,
    capacity: string,
    waitingListUrl: string,
  ) => void;
};

const BookingAvailabilityFields = ({
  idPrefix,
  capacity: initialCapacity,
  status: initialStatus,
  waitingListUrl: initialWaitingListUrl,
  onChangeBookingAvailability,
  ...boxProps
}: BookingAvailabilityFieldsProps) => {
  const { t } = useTranslation();

  const [capacity, setCapacity] = useState(initialCapacity);
  const [status, setStatus] = useState(initialStatus);
  const [waitingListUrl, setWaitingListUrl] = useState(initialWaitingListUrl);
  const [hasInvalidWaitingListUrl, setHasInvalidWaitingListUrl] =
    useState(false);

  const isCapacityInvalid =
    capacity !== '' &&
    (!Number.isInteger(Number(capacity)) || Number(capacity) < 0);

  const isInvalid = isCapacityInvalid || hasInvalidWaitingListUrl;

  const handleCapacityBlur = () => {
    if (isInvalid) return;
    onChangeBookingAvailability(status, capacity, waitingListUrl);
  };

  const handleWaitingListUrlBlur = () => {
    const prefixedUrl =
      waitingListUrl === '' ? '' : prefixUrlWithHttps(waitingListUrl);

    if (prefixedUrl !== '' && !isValidUrl(prefixedUrl)) {
      setHasInvalidWaitingListUrl(true);
      return;
    }

    setHasInvalidWaitingListUrl(false);
    setWaitingListUrl(prefixedUrl);
    if (isCapacityInvalid) return;
    onChangeBookingAvailability(status, capacity, prefixedUrl);
  };

  return (
    <Inline
      spacing={4}
      flexWrap="wrap"
      alignItems="flex-start"
      {...getInlineProps(boxProps)}
    >
      {IS_CAPACITY_VISIBLE && (
        <FormElement
          id={`${idPrefix}-max-capacity`}
          label={t('create.additionalInformation.booking_info.max_capacity')}
          Component={
            <Input
              className="tw:max-w-32"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              onBlur={handleCapacityBlur}
            />
          }
          error={
            isCapacityInvalid &&
            t('create.additionalInformation.booking_info.capacity_error')
          }
        />
      )}
      <FormElement
        id={`${idPrefix}-status`}
        label={t('create.additionalInformation.booking_info.status')}
        Component={
          <Select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value as BookingAvailabilityValue;
              setStatus(newStatus);
              if (isInvalid) return;
              onChangeBookingAvailability(newStatus, capacity, waitingListUrl);
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
