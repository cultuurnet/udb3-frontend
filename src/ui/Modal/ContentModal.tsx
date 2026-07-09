import type { ReactNode } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';

import { getGlobalBorderRadius, getValueFromTheme } from '../theme';

const getValueForModal = getValueFromTheme('modal');

type Props = {
  className?: string;
  visible?: boolean;
  title?: ReactNode;
  scrollable?: boolean;
  onShow?: () => void;
  onClose?: () => void;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const ContentModal = ({
  visible = false,
  title = '',
  scrollable = true,
  onShow = () => {},
  onClose = () => {},
  children,
  size = 'xl',
  className,
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
  </BootstrapModal>
);

export { ContentModal };
export type { Props as ContentModalProps };
