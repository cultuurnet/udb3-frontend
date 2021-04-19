import PropTypes from 'prop-types';
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

const ReasonAndTypeForm = ({
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
    [offerType],
  );

  return (
    <Stack spacing={5} {...getStackProps(props)}>
      <RadioButtonGroup
        key="offerStatus"
        groupLabel={t('offerStatus.newStatus')}
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        name="offerStatus"
        items={radioButtonItems}
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        selected={statusType}
        onChange={onChangeStatusType}
      />
      <Stack key="reason" spacing={2}>
        <Stack spacing={3}>
          <TextAreaWithLabel
            id="reason"
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            label={t('offerStatus.reason')}
            value={statusReason}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            onInput={onInputStatusReason}
            disabled={statusType === OfferStatus.AVAILABLE}
          />
          {statusReason.length > 200 && (
            <Alert variant={AlertVariants.DANGER}>
              {t('offerStatus.maxLengthReason', {
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                amount: 200,
              })}
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            </Alert>
          )}
        </Stack>
        <Text color={getValue('infoTextColor')}>
          {t('offerStatus.reasonTip')}
        </Text>
      </Stack>
    </Stack>
  );
};

// @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
ReasonAndTypeForm.propTypes = {
  offerType: PropTypes.string,
  statusType: PropTypes.string,
  statusReason: PropTypes.string,
  onChangeStatusType: PropTypes.func,
  onInputStatusReason: PropTypes.func,
};

export { ReasonAndTypeForm };
