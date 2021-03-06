import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Box } from '@/ui/Box';
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
      variant={ModalVariants.QUESTION}
      visible={visible}
      onConfirm={onConfirm}
      onClose={onClose}
      title={t('productions.delete.title')}
      confirmTitle={t('productions.overview.confirm')}
      cancelTitle={t('productions.overview.cancel')}
    >
      <Box padding={4}>
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
