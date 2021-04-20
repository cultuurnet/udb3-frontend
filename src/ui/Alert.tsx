import { Alert as BootstrapAlert } from 'react-bootstrap';
import { getValueFromTheme } from './theme';
import { getBoxProps, Box, BoxProps } from './Box';
import type { Values } from '@/types/Values';

const AlertVariants = {
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  DARK: 'dark',
} as const;

const getValue = getValueFromTheme('alert');

type Props = {
  variant?: Values<typeof AlertVariants>;
  visible?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
} & BoxProps;

const Alert = ({
  variant,
  visible,
  dismissible,
  onDismiss,
  children,
  className,
  ...props
}: Props) => {
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

Alert.defaultProps = {
  visible: true,
  variant: AlertVariants.INFO,
  dismissible: false,
  onDismiss: () => {},
};

export { AlertVariants, Alert };
