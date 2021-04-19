import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box } from '@/ui/Box';
import { Modal, ModalVariants } from '@/ui/Modal';

type Props = {
  productionName?: string;
  eventCount?: number;
  visible?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
};

const DeleteModal = ({
  productionName,
  eventCount,
  visible,
  onConfirm,
  onClose,
}: Props) => {
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

export { DeleteModal };
