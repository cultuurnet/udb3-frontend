import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { UrlLabelType } from '@/constants/UrlLabelType';
import type { Values } from '@/types/Values';
import type { BoxProps } from '@/ui/Box';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { LabelVariants } from '@/ui/Label';
import { Select } from '@/ui/Select';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors } from '@/ui/theme';
import { isValidUrl } from '@/utils/isValidInfo';
import { prefixUrlWithHttps } from '@/utils/url';

type UrlLabelValue = Values<typeof UrlLabelType> | '';

type BookingAvailabilityValue = Values<typeof BookingAvailabilityType>;

type UrlLabelOption = { label: string; value: UrlLabelValue };

const ReservationLinksSectionVariants = {
  CARD: 'card',
  INLINE: 'inline',
} as const;

type ReservationLinksSectionProps = BoxProps & {
  title?: string;
  variant?: Values<typeof ReservationLinksSectionVariants>;
  idPrefix: string;
  url: string;
  urlLabel: UrlLabelValue;
  capacity: string;
  status: BookingAvailabilityValue;
  // Booking availability (capacity + status) can only be updated for single and
  // multiple calendar types, so it is hidden for offers without subEvents.
  showBookingAvailability?: boolean;
  urlLabelOptions: UrlLabelOption[];
  onChangeBookingInfo: (url: string, urlLabel: UrlLabelValue) => void;
  onChangeBookingAvailability?: (
    status: BookingAvailabilityValue,
    capacity: string,
  ) => void;
};

const ReservationLinksSection = ({
  title,
  variant = ReservationLinksSectionVariants.CARD,
  idPrefix,
  url: initialUrl,
  urlLabel: initialUrlLabel,
  capacity: initialCapacity,
  status: initialStatus,
  showBookingAvailability = true,
  urlLabelOptions,
  onChangeBookingInfo,
  onChangeBookingAvailability,
  ...boxProps
}: ReservationLinksSectionProps) => {
  const { t } = useTranslation();

  const [url, setUrl] = useState(initialUrl);
  const [urlLabel, setUrlLabel] = useState(initialUrlLabel);
  const [capacity, setCapacity] = useState(initialCapacity);
  const [status, setStatus] = useState(initialStatus);
  const [hasInvalidUrl, setHasInvalidUrl] = useState(false);

  const isCapacityInvalid =
    capacity !== '' &&
    (!Number.isInteger(Number(capacity)) || Number(capacity) < 0);

  const handleUrlBlur = () => {
    if (url === '') {
      setHasInvalidUrl(false);
      onChangeBookingInfo('', urlLabel);
      return;
    }

    const prefixedUrl = prefixUrlWithHttps(url);

    if (!isValidUrl(prefixedUrl)) {
      setHasInvalidUrl(true);
      return;
    }

    setHasInvalidUrl(false);
    setUrl(prefixedUrl);
    onChangeBookingInfo(prefixedUrl, urlLabel);
  };

  const handleCapacityBlur = () => {
    if (isCapacityInvalid) return;
    onChangeBookingAvailability?.(status, capacity);
  };

  const isCard = variant === ReservationLinksSectionVariants.CARD;

  return (
    <Stack
      spacing={4}
      padding={isCard ? 4 : 0}
      css={
        isCard
          ? `
        border: 1px solid ${colors.grey3};
        border-radius: 0.5rem;
      `
          : undefined
      }
      {...getStackProps(boxProps)}
    >
      {isCard && title && <Text fontWeight="bold">{title}</Text>}
      <Inline spacing={4} flexWrap="wrap">
        <FormElement
          flex={1}
          id={`${idPrefix}-link`}
          labelVariant={LabelVariants.NORMAL}
          labelColor={colors.udbMainDarkBlue}
          label={t('create.additionalInformation.booking_info.link')}
          Component={
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
            />
          }
          error={
            hasInvalidUrl &&
            t('create.additionalInformation.booking_info.url_error')
          }
        />
        {showBookingAvailability && (
          <FormElement
            flex={1}
            id={`${idPrefix}-max-capacity`}
            labelVariant={LabelVariants.NORMAL}
            labelColor={colors.udbMainDarkBlue}
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
        )}
      </Inline>
      <Inline spacing={4} flexWrap="wrap">
        {showBookingAvailability && (
          <FormElement
            flex={1}
            id={`${idPrefix}-status`}
            labelVariant={LabelVariants.NORMAL}
            labelColor={colors.udbMainDarkBlue}
            label={t('create.additionalInformation.booking_info.status')}
            Component={
              <Select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as BookingAvailabilityValue;
                  setStatus(newStatus);
                  onChangeBookingAvailability?.(newStatus, capacity);
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
        )}
        <FormElement
          flex={1}
          id={`${idPrefix}-url-label`}
          labelVariant={LabelVariants.NORMAL}
          labelColor={colors.udbMainDarkBlue}
          label={t(
            'create.additionalInformation.booking_info.url_label_dropdown_label',
          )}
          Component={
            <Select
              value={urlLabel}
              onChange={(e) => {
                const newUrlLabel = e.target.value as UrlLabelValue;
                setUrlLabel(newUrlLabel);
                onChangeBookingInfo(url, newUrlLabel);
              }}
            >
              {urlLabelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          }
        />
      </Inline>
    </Stack>
  );
};

export { ReservationLinksSection, ReservationLinksSectionVariants };
export type { ReservationLinksSectionProps };
