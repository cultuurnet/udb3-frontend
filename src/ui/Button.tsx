import type { ComponentType, MouseEvent, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { buttonCSS, ButtonLegacy } from './ButtonLegacy';
import type { Icons } from './Icon';
import { Icon } from './Icon';
import { Button as ShadcnButton, buttonVariants } from './shadcn/button';
import { Spinner, SpinnerSizes, SpinnerVariants } from './Spinner';
import { Text } from './Text';

const ButtonVariants = {
  PRIMARY: 'primary',
  // Legacy's original "secondary" button (white surface, dark text, heavy shadow) —
  // named NEUTRAL because it doesn't use the shared secondary/grey-fill design token.
  NEUTRAL: 'neutral',
  // Grey-fill button matching the shared --color-secondary token (Badge's own
  // "secondary" variant uses the same token). Not used by any call site yet.
  SECONDARY: 'secondary',
  SECONDARY_TOGGLE: 'secondary-toggle',
  SUCCESS: 'success',
  DANGER: 'danger',
  ICON: 'icon',
  UNSTYLED: 'unstyled',
  LINK: 'link',
  LINK_DANGER: 'link-danger',
  OUTLINED: 'outlined',
} as const;

const ButtonSizes = {
  SMALL: 'sm',
  LARGE: 'lg',
} as const;

type ButtonProps = {
  children?: ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
  iconName?: Values<typeof Icons>;
  suffix?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  customChildren?: boolean;
  shouldHideText?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: Values<typeof ButtonSizes>;
  variant?: Values<typeof ButtonVariants>;
  type?: 'button' | 'submit' | 'reset';
  active?: boolean;
  outlineColor?: string;
  title?: string;
  forwardedAs?: string | ComponentType<any>;
};

const buttonVariantMap = {
  [ButtonVariants.PRIMARY]: 'default',
  [ButtonVariants.NEUTRAL]: 'neutral',
  [ButtonVariants.SECONDARY]: 'secondary',
  [ButtonVariants.SECONDARY_TOGGLE]: 'secondary-toggle',
  [ButtonVariants.SUCCESS]: 'success',
  [ButtonVariants.DANGER]: 'destructive',
  [ButtonVariants.ICON]: 'icon',
  [ButtonVariants.UNSTYLED]: 'unstyled',
  [ButtonVariants.LINK]: 'link',
  [ButtonVariants.LINK_DANGER]: 'link-danger',
  [ButtonVariants.OUTLINED]: 'outlined',
} as const;

const sizeMap = {
  [ButtonSizes.SMALL]: 'sm',
  [ButtonSizes.LARGE]: 'lg',
} as const;

const ButtonShadcn = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      iconName,
      suffix,
      variant = ButtonVariants.PRIMARY,
      disabled = false,
      loading = false,
      children,
      customChildren = false,
      shouldHideText = false,
      onClick,
      onMouseDown,
      className,
      id,
      'aria-label': ariaLabel,
      title,
      size,
      type = 'button',
      active,
      outlineColor: _outlineColor,
    },
    ref,
  ) => {
    const suffixElement = suffix as ReactElement<{ className?: string }>;
    const clonedSuffix = suffixElement
      ? cloneElement(suffixElement, {
          ...suffixElement.props,
          className: cn(suffixElement.props.className, 'tw:self-end'),
          key: 'suffix',
        })
      : undefined;

    const inner: ReactNode = loading ? (
      <Spinner variant={SpinnerVariants.LIGHT} size={SpinnerSizes.SMALL} />
    ) : (
      [
        iconName && <Icon name={iconName} key="icon" />,
        customChildren
          ? children
          : !shouldHideText &&
            !!children && (
              <Text flex={1} textAlign="left" key="text">
                {children}
              </Text>
            ),
        clonedSuffix,
      ]
    );

    return (
      <ShadcnButton
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        onMouseDown={onMouseDown}
        title={title}
        type={type}
        variant={buttonVariantMap[variant]}
        size={size ? sizeMap[size] : undefined}
        active={active}
        className={cn(
          'tw:flex tw:items-center',
          loading ? 'tw:justify-center' : 'tw:justify-start',
          iconName && 'tw:gap-2',
          className,
        )}
      >
        {inner}
      </ShadcnButton>
    );
  },
);

ButtonShadcn.displayName = 'ButtonShadcn';

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <ButtonShadcn {...props} ref={ref} />;
  }

  return <ButtonLegacy {...props} ref={ref} />;
});

Button.displayName = 'Button';

export {
  Button,
  buttonCSS,
  ButtonSizes,
  buttonVariantMap,
  ButtonVariants,
  buttonVariants,
};
export type { ButtonProps };
