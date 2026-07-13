import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import type { Values } from '@/types/Values';
import type { BoxProps } from '@/ui/Box';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';

type BookingAvailabilityValue = Values<typeof BookingAvailabilityType>;

type BookingAvailabilityFieldsProps = BoxProps & {
  idPrefix: string;
  capacity: string;
  status: BookingAvailabilityValue;
  onChangeBookingAvailability: (
    status: BookingAvailabilityValue,
    capacity: string,
  ) => void;
};

const BookingAvailabilityFields = ({
  idPrefix,
  capacity: initialCapacity,
  status: initialStatus,
  onChangeBookingAvailability,
  ...boxProps
}: BookingAvailabilityFieldsProps) => {
  const { t } = useTranslation();

  const [capacity, setCapacity] = useState(initialCapacity);
  const [status, setStatus] = useState(initialStatus);

  const isCapacityInvalid =
    capacity !== '' &&
    (!Number.isInteger(Number(capacity)) || Number(capacity) < 0);

  const handleCapacityBlur = () => {
    if (isCapacityInvalid) return;
    onChangeBookingAvailability(status, capacity);
  };

  return (
    <Inline
      spacing={4}
      flexWrap="wrap"
      alignItems="flex-start"
      {...getInlineProps(boxProps)}
    >
      <FormElement
        id={`${idPrefix}-max-capacity`}
        label={t('create.additionalInformation.booking_info.max_capacity')}
        Component={
          <Input
            maxWidth="8rem"
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
      <FormElement
        id={`${idPrefix}-status`}
        label={t('create.additionalInformation.booking_info.status')}
        Component={
          <Select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value as BookingAvailabilityValue;
              setStatus(newStatus);
              if (isCapacityInvalid) return;
              onChangeBookingAvailability(newStatus, capacity);
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
    </Inline>
  );
};

export { BookingAvailabilityFields };
