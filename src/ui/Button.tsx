import type { ReactNode } from 'react';
import { cloneElement, forwardRef } from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import { css } from 'styled-components';

import type { Values } from '@/types/Values';

import type { Icons } from './Icon';
import { Icon } from './Icon';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Link } from './Link';
import { Spinner, SpinnerSizes, SpinnerVariants } from './Spinner';
import { Text } from './Text';
import { getGlobalFormInputHeight, getValueFromTheme } from './theme';

const BootStrapVariants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SECONDARY_TOGGLE: 'secondary-toggle',
  SUCCESS: 'success',
  DANGER: 'danger',
  ICON: 'icon',
} as const;

const ButtonVariants = {
  ...BootStrapVariants,
  UNSTYLED: 'unstyled',
  LINK: 'link',
} as const;

const ButtonSizes = {
  SMALL: 'sm',
  LARGE: 'lg',
} as const;

const getValue = getValueFromTheme('button');
const getGlobalValue = getValueFromTheme('global');

const BaseButton = (props: Omit<InlineProps, 'size'>) => (
  <Inline as="button" {...props} />
);

const customCSS = css`
  &.btn {
    border-radius: ${getValue('borderRadius')};
    padding: ${getValue('paddingY')} ${getValue('paddingX')};
    flex-shrink: 0;
    align-items: center;
    min-height: ${getGlobalFormInputHeight};

    border: none;
    box-shadow: ${getValue('boxShadow.small')};

    &:focus,
    &.focus {
      outline: solid black;
    }

    &:focus:not(:focus-visible),
    &.focus:not(:focus-visible) {
      outline: none;
      box-shadow: none;
    }

    // active & focus
    &:not(:disabled):not(.disabled):active:focus,
    &:not(:disabled):not(.disabled).active:focus {
      box-shadow: ${getValue('boxShadow.small')};
    }
  }

  &.btn-primary {
    color: ${getValue('primary.color')};
    background-color: ${getValue('primary.backgroundColor')};

    &.dropdown-toggle.dropdown-toggle-split {
      box-shadow: 2px 2px 3px 0px rgb(210 210 210 / 70%);
      border-left: 1px solid ${getValue('primary.color')};
    }

    &:hover {
      background-color: ${getValue('primary.hoverBackgroundColor')};
    }

    // active
    &.btn-primary:not(:disabled):not(.disabled):active,
    .btn-primary:not(:disabled):not(.disabled).active {
      background-color: ${getValue('primary.activeBackgroundColor')};
      box-shadow: ${getValue('boxShadow.small')};
    }
  }

  &.btn-secondary {
    color: ${getValue('secondary.color')};
    background-color: ${getValue('secondary.backgroundColor')};
    box-shadow: ${getGlobalValue('boxShadow.heavy')};

    &.dropdown-toggle.dropdown-toggle-split {
      box-shadow: 4px 4px 6px 0px rgb(210 210 210 / 70%);
      border-left: 1px solid #f0f0f0;
    }

    &:hover {
      background-color: ${getValue('secondary.hoverBackgroundColor')};
    }

    &.btn-secondary:not(:disabled):not(.disabled):focus,
    .btn-secondary:not(:disabled):not(.disabled).focus {
      box-shadow: ${getGlobalValue('boxShadow.heavy')};
    }

    // active
    &.btn-secondary:not(:disabled):not(.disabled):active,
    .btn-secondary:not(:disabled):not(.disabled).active {
      color: ${getValue('secondary.activeColor')};
      background-color: ${getValue('secondary.activeBackgroundColor')};
      box-shadow: ${getGlobalValue('boxShadow.heavy')};
      border: none;
    }

    &:not(:disabled):not(.disabled).active,
    &:not(:disabled):not(.disabled):active {
      color: ${getValue('secondary.activeColor')};
      background-color: ${getValue('secondary.activeBackgroundColor')};
    }
  }

  &.btn-outline-secondary {
    box-shadow: ${getGlobalValue('boxShadow.heavy')};

    &:hover {
      background-color: ${getValue('secondary.hoverBackgroundColor')};
      color: inherit;
    }
  }

  &.btn-secondary-toggle {
    color: ${getValue('secondaryToggle.color')};
    box-shadow: none !important;
    border: 1px solid ${getValue('secondaryToggle.borderColor')};

    &:hover {
      border-color: ${getValue('secondaryToggle.hoverBorderColor')};
      color: ${getValue('secondaryToggle.activeColor')};

      span {
        color: ${getValue('secondaryToggle.activeColor')};
      }
    }

    &.btn-secondary-toggle:not(:disabled):not(.disabled):active,
    .btn-secondary-toggle:not(:disabled):not(.disabled).active {
      color: ${getValue('secondaryToggle.activeColor')};
      background-color: ${getValue('secondaryToggle.activeBackgroundColor')};
      border-color: ${getValue('secondaryToggle.activeBorderColor')};

      span {
        color: ${getValue('secondaryToggle.activeColor')};
      }
    }

    &:not(:disabled):not(.disabled).active,
    &:not(:disabled):not(.disabled):active {
      background-color: ${getValue('secondaryToggle.activeBackgroundColor')};
      border-color: ${getValue('secondaryToggle.activeBorderColor')};

      span {
        color: ${getValue('secondaryToggle.activeColor')};
      }
    }
  }

  &.btn-success {
    color: ${getValue('success.color')};
    background-color: ${getValue('success.backgroundColor')};

    &.dropdown-toggle.dropdown-toggle-split {
      box-shadow: 2px 2px 3px 0px rgb(210 210 210 / 70%);
      border-left: 1px solid ${getValue('success.color')};
    }

    &:hover {
      background-color: ${getValue('success.hoverBackgroundColor')};
    }
  }

  &.btn-danger {
    color: ${getValue('danger.color')};
    background-color: ${getValue('danger.backgroundColor')};
    border: 1px solid ${getValue('danger.backgroundColor')};

    &.dropdown-toggle.dropdown-toggle-split {
      box-shadow: 2px 2px 3px 0px rgb(210 210 210 / 70%);
      border: none;
      border-left: 1px solid ${getValue('danger.color')};
    }

    &:hover {
      background-color: ${getValue('danger.hoverBackgroundColor')};
    }
  }

  &.btn-icon {
    padding: 0.75rem;
    border-radius: 50%;
    width: 2.8rem;
    height: 2.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    transition: background-color 0.2s ease;
    position: relative;

    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &:hover {
      background-color: ${getValue('icon.hoverBackgroundColor')};
    }

    &:active {
      background-color: ${getValue('icon.focusBackgroundColor')};
      animation: pulse 0.3s ease-out;

      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    }
  }

  .button-spinner {
    height: 1.5rem;
    display: flex;
    align-items: center;
  }
`;

type ButtonProps = Omit<InlineProps, 'size'> & {
  iconName?: Values<typeof Icons>;
  suffix?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  customChildren?: boolean;
  shouldHideText?: boolean;
  size?: Values<typeof ButtonSizes>;
  variant?: Values<typeof ButtonVariants>;
  type?: string;
  active?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      iconName,
      suffix,
      variant,
      disabled,
      loading,
      children,
      customChildren,
      shouldHideText,
      onClick,
      className,
      title,
      size,
      forwardedAs,
      type,
      active,
      ...props
    },
    ref,
  ) => {
    const isBootstrapVariant = (
      Object.values(BootStrapVariants) as string[]
    ).includes(variant);
    const isLinkVariant = variant === ButtonVariants.LINK;

    if (variant === ButtonVariants.SECONDARY) variant = 'secondary';

    const BaseButtonWithForwardedAs = (props) => (
      <BaseButton {...props} forwardedAs={forwardedAs} />
    );

    const forwardedButton = forwardedAs
      ? BaseButtonWithForwardedAs
      : BaseButton;
    const bootstrapProps = isBootstrapVariant
      ? { forwardedAs: forwardedButton, variant }
      : {};

    const propsToApply = {
      ...bootstrapProps,
      disabled,
      onClick,
      className,
      title,
      size,
      type,
      active,
      ref,
      ...getInlineProps(props),
    };

    const clonedSuffix = suffix
      ? // @ts-expect-error
        cloneElement(suffix, {
          // @ts-expect-error
          ...suffix.props,
          css: `align-self: flex-end`,
          key: 'suffix',
        })
      : undefined;

    const inner = loading ? (
      <Spinner
        className="button-spinner"
        variant={SpinnerVariants.LIGHT}
        size={SpinnerSizes.SMALL}
      />
    ) : (
      [
        iconName && <Icon name={iconName} key="icon" />,
        customChildren
          ? children
          : !shouldHideText && (
              <Text flex={1} textAlign="left" key="text">
                {children}
              </Text>
            ),
        clonedSuffix,
      ]
    );

    if (isBootstrapVariant) {
      return (
        <BootstrapButton {...propsToApply} css={customCSS}>
          {inner}
        </BootstrapButton>
      );
    }

    if (isLinkVariant) {
      return (
        <BaseButton
          {...propsToApply}
          color="inherit"
          cursor="pointer"
          css={`
            background: none;
            border: none;

            :focus {
              outline: auto;
            }

            :focus:not(:focus-visible) {
              outline: none;
              box-shadow: none;
            }
          `}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Link as="span" href="">
            {children}
          </Link>
        </BaseButton>
      );
    }

    return (
      <BaseButton
        {...propsToApply}
        color="inherit"
        cursor="pointer"
        css={`
          background: none;
          border: none;

          :focus {
            outline: auto;
          }

          :focus:not(:focus-visible) {
            outline: none;
            box-shadow: none;
          }
        `}
        alignItems="center"
        justifyContent="flex-start"
      >
        {inner}
      </BaseButton>
    );
  },
);

Button.displayName = 'Button';

Button.defaultProps = {
  variant: ButtonVariants.PRIMARY,
  disabled: false,
  loading: false,
  customChildren: false,
  shouldHideText: false,
  textAlign: 'center',
  type: 'button',
};

export { Button, customCSS as buttonCSS, ButtonSizes, ButtonVariants };
