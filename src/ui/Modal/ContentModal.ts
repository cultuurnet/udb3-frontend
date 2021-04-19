import PropTypes from 'prop-types';
import { Modal as BootstrapModal } from 'react-bootstrap';

const ContentModal = ({
  visible,
  title,
  onShow,
  onClose,
  children,
  size,
  className,
}) => (
  <BootstrapModal
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ className: any; }' is not assignable to ty... Remove this comment to see the full error message
    className={className}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'show'.
    show={visible}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'onShow'.
    onShow={onShow}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'onHide'.
    onHide={onClose}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'keyboard'.
    keyboard={false}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'size'.
    size={size}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'css'. Did you mean 'CSS'?
    css={`
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
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
    // @ts-expect-error ts-migrate(2713) FIXME: Cannot access 'BootstrapModal.Header' because 'Boo... Remove this comment to see the full error message
    <BootstrapModal.Header closeButton>
      // @ts-expect-error ts-migrate(2713) FIXME: Cannot access 'BootstrapModal.Title' because 'Boot... Remove this comment to see the full error message
      <BootstrapModal.Title hidden={!title}>{title}</BootstrapModal.Title>
    </BootstrapModal.Header>
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    <BootstrapModal.Body>{children}</BootstrapModal.Body>
  </BootstrapModal>
);

ContentModal.propTypes = {
  className: PropTypes.string,
  visible: PropTypes.bool,
  title: PropTypes.string,
  onShow: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
  size: PropTypes.string,
};

ContentModal.defaultProps = {
  visible: false,
  title: '',
  size: 'xl',
  onShow: () => {},
  onClose: () => {},
};

export { ContentModal };
