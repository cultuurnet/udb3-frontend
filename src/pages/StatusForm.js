import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OfferStatus } from '@/constants/OfferStatus';
import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { TextArea } from '@/ui/TextArea';

const StatusForm = ({
  offerType,
  statusType,
  statusReason,
  onChangeStatusType,
  onInputStatusReason,
  ...props
}) => {
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
    [t, offerType],
  );

  return (
    <Stack spacing={5} {...getStackProps(props)}>
      <RadioButtonGroup
        key="offerStatus"
        name="offerStatus"
        items={radioButtonItems}
        selected={statusType}
        onChange={onChangeStatusType}
      />
      <Stack key="reason" spacing={2}>
        <Stack spacing={3}>
          <FormElement
            id="reason"
            label={t('offerStatus.reason')}
            Component={
              <TextArea
                value={statusReason}
                onInput={onInputStatusReason}
                disabled={statusType === OfferStatus.AVAILABLE}
              />
            }
          />
          {statusReason.length > 200 && (
            <Alert variant={AlertVariants.DANGER}>
              {t('offerStatus.maxLengthReason', {
                amount: 200,
              })}
            </Alert>
          )}
        </Stack>
        <Text variant={TextVariants.MUTED}>{t('offerStatus.reasonTip')}</Text>
      </Stack>
    </Stack>
  );
};

StatusForm.propTypes = {
  offerType: PropTypes.string,
  statusType: PropTypes.string,
  statusReason: PropTypes.string,
  onChangeStatusType: PropTypes.func,
  onInputStatusReason: PropTypes.func,
};

export { StatusForm };
