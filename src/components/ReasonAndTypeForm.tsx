import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertVariants } from '@/ui/Alert';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { TextAreaWithLabel } from '@/ui/TextAreaWithLabel';
import { getValueFromTheme } from '@/ui/theme';

import { OfferStatus } from '@/constants/OfferStatus';

const getValue = getValueFromTheme('statusPage');

type Props = {
  offerType: string;
  statusType: string;
  statusReason: string;
  onChangeStatusType: () => void;
  onInputStatusReason: () => void;
};

const ReasonAndTypeForm = ({
  offerType,
  statusType,
  statusReason,
  onChangeStatusType,
  onInputStatusReason,
  ...props
}: Props) => {
  const { t } = useTranslation();

  const radioButtonItems = useMemo(
    () => [
      {
        label: t(`offerStatus.status.${offerType}.available`),
        value: OfferStatus.AVAILABLE,
      },
      {
        label: t(`offerStatus.status.${offerType}.temporarilyUnavailable`),
        value: OfferStatus.TEMPORARILY_UNAVAILABLE,
        info: t(`offerStatus.status.${offerType}.temporarilyUnavailableInfo`),
      },
      {
        label: t(`offerStatus.status.${offerType}.unavailable`),
        value: OfferStatus.UNAVAILABLE,
        info: t(`offerStatus.status.${offerType}.unavailableInfo`),
      },
    ],
    [offerType],
  );

  return (
    <Stack spacing={5} {...getStackProps(props)}>
      <RadioButtonGroup
        key="offerStatus"
        groupLabel={t('offerStatus.newStatus')}
        name="offerStatus"
        items={radioButtonItems}
        selected={statusType}
        onChange={onChangeStatusType}
      />
      <Stack key="reason" spacing={2}>
        <Stack spacing={3}>
          <TextAreaWithLabel
            id="reason"
            label={t('offerStatus.reason')}
            value={statusReason}
            onInput={onInputStatusReason}
            disabled={statusType === OfferStatus.AVAILABLE}
          />
          {statusReason.length > 200 && (
            <Alert variant={AlertVariants.DANGER}>
              {t('offerStatus.maxLengthReason', {
                amount: 200,
              })}
            </Alert>
          )}
        </Stack>
        <Text color={getValue<string>('infoTextColor')}>
          {t('offerStatus.reasonTip')}
        </Text>
      </Stack>
    </Stack>
  );
};

export { ReasonAndTypeForm };
