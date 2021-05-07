import PropTypes from 'prop-types';
import { Alert as BootstrapAlert } from 'react-bootstrap';

import { Box, getBoxProps } from './Box';
import { getValueFromTheme } from './theme';

const AlertVariants = {
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  DARK: 'dark',
};

const getValue = getValueFromTheme(`alert`);

const Alert = ({
  variant,
  visible,
  dismissible,
  onDismiss,
  children,
  className,
  ...props
}) => {
  return (
    <Box {...getBoxProps(props)}>
      <BootstrapAlert
        variant={variant}
        hidden={!visible}
        dismissible={dismissible}
        className={className}
        css={`
          margin: 0;
          &.alert {
            border-radius: ${getValue('borderRadius')};
          }
        `}
        onClose={onDismiss}
      >
        {children}
      </BootstrapAlert>
    </Box>
  );
};

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(AlertVariants)),
  visible: PropTypes.bool,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  children: PropTypes.node,
};

Alert.defaultProps = {
  visible: true,
  variant: AlertVariants.INFO,
  dismissible: false,
};

export { Alert, AlertVariants };
