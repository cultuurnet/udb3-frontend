import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Box' or its corresponding... Remove this comment to see the full error message
import { Box } from '@/ui/Box';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Modal' or its correspondi... Remove this comment to see the full error message
import { Modal, ModalVariants } from '@/ui/Modal';

const DeleteModal = ({
  productionName,
  eventCount,
  visible,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'variant'. Did you mean 'invarian... Remove this comment to see the full error message
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={onConfirm}
      onClose={onClose}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'title'.
      title={t('productions.delete.title')}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'confirmTitle'.
      confirmTitle={t('productions.overview.confirm')}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cancelTitle'.
      cancelTitle={t('productions.overview.cancel')}
    >
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'padding'.
      <Box padding={4}>
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
        {eventCount > 1
          ? t('productions.overview.delete_question_events', {
              eventCount,
              productionName,
            })
          : t('productions.overview.delete_question_event', { productionName })}
      </Box>
    </Modal>
  );
};

DeleteModal.propTypes = {
  productionName: PropTypes.string,
  eventCount: PropTypes.number,
  visible: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export { DeleteModal };
