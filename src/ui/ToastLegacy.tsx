import { useMemo } from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
import { css } from 'styled-components';

import type { Values } from '@/types/Values';
import { Icon, Icons } from '@/ui/Icon';

import { Box, parseSpacing } from './Box';
import { getGlobalBorderRadius, getValueFromTheme } from './theme';

const ToastVariants = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
} as const;

const getValue = getValueFromTheme('toast');

const commonCss = css`
  &.toast {
    border-radius: ${getGlobalBorderRadius};

    position: fixed;
    right: ${parseSpacing(3)()};
    top: ${parseSpacing(3)()};

    z-index: ${getValue('zIndex')};

    min-width: ${parseSpacing(8)()};
  }
`;

const VariantToStylesMap = {
  [ToastVariants.SUCCESS]: css`
    ${commonCss}
    &.bg-success {
      background-color: ${getValue('success.backgroundColor')} !important;
    }
  `,
  [ToastVariants.INFO]: css`
    ${commonCss}
    &.bg-info {
      background-color: ${getValue('success.backgroundColor')} !important;
    }
  `,
  [ToastVariants.DANGER]: css`
    ${commonCss}
    &.bg-danger {
      background-color: ${getValue('danger.backgroundColor')} !important;
    }
  `,
  [ToastVariants.WARNING]: css`
    ${commonCss}
    &.bg-warning {
      background-color: ${getValue('warning.backgroundColor')} !important;
    }
  `,
};

type Props = {
  variant: Values<typeof ToastVariants>;
  body: string;
  visible?: boolean;
  onClose?: () => void;
};

const ToastLegacy = ({
  variant = ToastVariants.SUCCESS,
  visible = true,
  body = '',
  onClose,
}: Props) => {
  const icon = useMemo(() => {
    const icons = {
      [ToastVariants.WARNING]: Icons.EXCLAMATION_CIRCLE,
      [ToastVariants.DANGER]: Icons.EXCLAMATION_CIRCLE,
      [ToastVariants.SUCCESS]: Icons.CHECK_CIRCLE,
      [ToastVariants.INFO]: Icons.INFO,
    };

    return icons[variant];
  }, [variant]);

  return (
    <BootstrapToast
      className={`d-inline-block m-1 p-2`}
      css={VariantToStylesMap[variant]}
      autohide
      delay={5000}
      show={visible}
      onClose={onClose}
    >
      <Box
        as={BootstrapToast.Body}
        backgroundColor="transparent"
        color={getValue('textColor.dark')}
        className={'d-flex justify-content-between align-items-center flex-row'}
      >
        <span className={'d-flex me-2'}>
          {icon && <Icon name={icon} className={`text-${variant} me-2`} />}
          {body}
        </span>
        {onClose && <Icon name={Icons.TIMES} onClick={onClose} width={10} />}
      </Box>
    </BootstrapToast>
  );
};

export { ToastLegacy, ToastVariants };
