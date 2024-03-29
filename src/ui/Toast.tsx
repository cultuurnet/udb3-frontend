import { useMemo } from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
import { css } from 'styled-components';

import type { Values } from '@/types/Values';
import { Icon, Icons } from '@/ui/Icon';

import { parseSpacing } from './Box';
import { Paragraph } from './Paragraph';
import { getGlobalBorderRadius, getValueFromTheme } from './theme';

const ToastVariants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
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
  [ToastVariants.PRIMARY]: css`
    ${commonCss}
    &.bg-primary {
      background-color: ${getValue('primary.backgroundColor')} !important;
    }
  `,
  [ToastVariants.SECONDARY]: css`
    ${commonCss}
    &.bg-secondary {
      color: ${getValue('secondary.color')} !important;
      background-color: ${getValue('secondary.backgroundColor')} !important;
    }
  `,
  [ToastVariants.SUCCESS]: css`
    ${commonCss}
    &.bg-success {
      background-color: ${getValue('success.backgroundColor')} !important;
    }
  `,
  [ToastVariants.DANGER]: css`
    ${commonCss}
    &.bg-danger {
      background-color: ${getValue('danger.backgroundColor')} !important;
    }
  `,
};

type Props = {
  variant: Values<typeof ToastVariants>;
  body: string;
  visible?: boolean;
  onClose?: () => void;
};

const Toast = ({ variant, visible, body, onClose }: Props) => {
  const icon = useMemo(() => {
    const icons = {
      [ToastVariants.PRIMARY]: Icons.QUESTION_CIRCLE,
      [ToastVariants.WARNING]: Icons.EXCLAMATION_CIRCLE,
      [ToastVariants.DANGER]: Icons.EXCLAMATION_CIRCLE,
      [ToastVariants.SUCCESS]: Icons.CHECK_CIRCLE,
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
      <Paragraph
        as={BootstrapToast.Body}
        backgroundColor="transparent"
        color={getValue('textColor.dark')}
        className={'d-flex justify-content-between align-items-center flex-row'}
      >
        <span className={'d-flex mr-2'}>
          {icon && <Icon name={icon} className={`text-${variant} mr-2`} />}
          {body}
        </span>
        {onClose && <Icon name={Icons.TIMES} onClick={onClose} width={10} />}
      </Paragraph>
    </BootstrapToast>
  );
};

Toast.defaultProps = {
  variant: ToastVariants.PRIMARY,
  visible: true,
  body: '',
};

export { Toast, ToastVariants };
