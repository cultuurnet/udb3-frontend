import type { ReactNode } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';

import type { Values } from '@/types/Values';

import { Button, ButtonVariants } from '../Button';
import { getGlobalBorderRadius, getValueFromTheme } from '../theme';

const getValueForModal = getValueFromTheme('modal');

type Props = {
  className?: string;
  visible?: boolean;
  title?: ReactNode;
  confirmTitle?: string;
  cancelTitle?: string;
  onShow?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  children?: ReactNode;
  scrollable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  confirmButtonDisabled?: boolean;
  confirmLoading?: boolean;
  confirmButtonVariant?: Values<typeof ButtonVariants>;
};

const QuestionModal = ({
  className,
  visible = false,
  title = '',
  confirmTitle = 'Ok',
  cancelTitle = 'Cancel',
  onShow,
  onClose,
  onConfirm,
  children,
  scrollable = true,
  size = 'sm',
  confirmButtonDisabled = false,
  confirmLoading,
  confirmButtonVariant = ButtonVariants.PRIMARY,
}: Props) => (
  <BootstrapModal
    className={className}
    show={visible}
    onShow={onShow}
    onHide={onClose}
    scrollable={scrollable}
    keyboard={false}
    size={size === 'md' ? undefined : size}
    css={`
      z-index: ${getValueForModal('zIndex')};

      .modal-title {
        font-size: 1.067rem;
        font-weight: 700;
      }

      .modal {
        overflow-y: hidden;
      }

      .modal-content {
        border-radius: ${getGlobalBorderRadius};
        max-height: 95vh;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        overflow: visible;
      }

      .modal-body {
        padding: 0;
      }
    `}
  >
    <BootstrapModal.Header closeButton>
      <BootstrapModal.Title hidden={!title}>{title}</BootstrapModal.Title>
    </BootstrapModal.Header>
    <BootstrapModal.Body>{children}</BootstrapModal.Body>
    <BootstrapModal.Footer>
      <Button variant={ButtonVariants.SECONDARY} onClick={onClose}>
        {cancelTitle}
      </Button>
      <Button
        loading={confirmLoading}
        variant={confirmButtonVariant}
        onClick={onConfirm}
        disabled={confirmButtonDisabled || confirmLoading}
      >
        {confirmTitle}
      </Button>
    </BootstrapModal.Footer>
  </BootstrapModal>
);

export { QuestionModal };
export type { Props as QuestionModalProps };
