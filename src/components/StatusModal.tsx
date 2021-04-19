import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Modal' or its correspondi... Remove this comment to see the full error message
import { Modal, ModalVariants } from '@/ui/Modal';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/components/ReasonAndTypeForm... Remove this comment to see the full error message
import { Stack } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/OfferType' or its ... Remove this comment to see the full error message
import { ReasonAndTypeForm } from '@/components/ReasonAndTypeForm';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { OfferType } from '@/constants/OfferType';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/OfferStatus' or it... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';
import { OfferStatus } from '@/constants/OfferStatus';

const StatusModal = ({ visible, loading, className, onClose, onConfirm }) => {
  const { t } = useTranslation();

  const [type, setType] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!visible) {
      setType('');
      setReason('');
    }
  }, [visible]);

  useEffect(() => {
    if (type === OfferStatus.AVAILABLE) {
      setReason('');
    }
  }, [type]);

  return (
    <Modal
      visible={visible}
      title={t('offerStatus.changeStatus')}
      variant={ModalVariants.QUESTION}
      size="xl"
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      className={className}
      confirmTitle={t('offerStatus.actions.save')}
      cancelTitle={t('offerStatus.actions.close')}
      onConfirm={() => onConfirm(type, reason)}
      onClose={onClose}
      confirmButtonDisabled={!type || reason.length > 200 || loading}
    >
      {/* @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message */}
      {loading ? (
        <Spinner marginY={4} />
      ) : (
        <Stack padding={4}>
          <ReasonAndTypeForm
            offerType={OfferType.EVENT}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            statusType={type}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            statusReason={reason}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            onChangeStatusType={(e) => setType(e.target.value)}
            onInputStatusReason={(e) => setReason(e.target.value)}
          />
        </Stack>
      )}
    {/* @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type. */}
    </Modal>
  );
};

StatusModal.propTypes = {
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};

export { StatusModal };
