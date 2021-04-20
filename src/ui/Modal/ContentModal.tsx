import { Modal as BootstrapModal } from 'react-bootstrap';

type Props = {
  className: string;
  visible?: boolean;
  title?: string;
  size?: 'sm' | 'lg' | 'xl';
  onShow?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};

const ContentModal = ({
  visible,
  title,
  onShow,
  onClose,
  children,
  size,
  className,
}: Props) => (
  <BootstrapModal
    className={className}
    show={visible}
    onShow={onShow}
    onHide={onClose}
    keyboard={false}
    size={size}
    css={`
      z-index: 2000;

      .modal-title {
        font-size: 1.067rem;
        font-weight: 700;
      }

      .modal {
        overflow-y: hidden;
      }

      .modal-content {
        border-radius: 0;
        max-height: 95vh;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
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

ContentModal.defaultProps = {
  visible: false,
  title: '',
  size: 'xl',
  onShow: () => {},
  onClose: () => {},
};

export { ContentModal };
