import type { ReactElement } from 'react';
import { Children, cloneElement } from 'react';
import {
  ButtonGroup as BootstrapButtonGroup,
  Dropdown as BootstrapDropdown,
} from 'react-bootstrap';
import { DropdownItemProps } from 'react-bootstrap/DropdownItem';

import { Box } from '@/ui/Box';
import { Button, buttonCSS, ButtonVariants } from '@/ui/Button';
import { Link, LinkVariants } from '@/ui/Link';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

import type { DropdownProps } from './Dropdown';
import { Divider, DropDownVariants, Item } from './Dropdown';

type DropdownLegacyProps = DropdownProps;

const getGlobalValue = getValueFromTheme('global');
const { grey1 } = colors;

const DropdownLegacy = ({
  variant,
  isSplit = false,
  id,
  children,
  className,
}: DropdownLegacyProps) => {
  const isMenuChild = (child) => child.type === Item || child.type === Divider;
  const menuChildren = Children.toArray(children).filter(isMenuChild);

  const isPrimaryActionChild = (child) =>
    child.type === Button || child.type === Link;
  const primaryActionChild = Children.toArray(children).find(
    isPrimaryActionChild,
  ) as ReactElement<any>;

  if (!primaryActionChild) {
    throw new Error('Dropdown requires a Button or Link child');
  }

  const buttonVariant =
    variant === DropDownVariants.SECONDARY ? ButtonVariants.NEUTRAL : variant;

  const primaryAction = cloneElement(primaryActionChild, {
    ...primaryActionChild.props,
    variant: buttonVariant,
    className: 'primary-action',
  });

  return (
    <Box
      css={`
        .dropdown,
        .btn-group {
          box-shadow: ${getGlobalValue('boxShadow.heavy')};
          border-radius: ${getGlobalBorderRadius};
        }
        .btn-group:has(.dropdown-toggle-split) .primary-action,
        .btn-group:has(.dropdown-toggle-split) .primary-action > * {
          box-shadow: none;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .dropdown-menu {
          border-radius: ${getGlobalBorderRadius};
          overflow: hidden;
        }

        .dropdown-divider {
          margin: 0;
        }

        .btn-group {
          .dropdown-toggle-split {
            box-shadow: none;
            border-left: 1px solid ${grey1};
          }
        }
      `}
      id={id}
    >
      <BootstrapDropdown as={BootstrapButtonGroup}>
        {isSplit ? (
          primaryAction
        ) : (
          <BootstrapDropdown.Toggle
            variant={variant}
            className={className}
            css={buttonCSS}
          >
            {primaryActionChild.props.children}
          </BootstrapDropdown.Toggle>
        )}
        {menuChildren.length > 0 && (
          <>
            {isSplit && (
              <BootstrapDropdown.Toggle
                split
                variant={variant}
                css={`
                  ${buttonCSS}
                  &.btn {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                  }
                `}
              />
            )}
            <BootstrapDropdown.Menu>{menuChildren}</BootstrapDropdown.Menu>
          </>
        )}
      </BootstrapDropdown>
    </Box>
  );
};

const ItemLegacy = ({
  href,
  onClick,
  children,
}: Partial<DropdownItemProps>) => {
  if (onClick) {
    return (
      <BootstrapDropdown.Item
        forwardedAs={(props) => (
          <Button variant={ButtonVariants.NEUTRAL} {...props} />
        )}
        onClick={onClick}
        css={`
          &.btn {
            flex: 1;
            border: none;
            box-shadow: none;
            border-radius: 0;
          }
        `}
      >
        {children}
      </BootstrapDropdown.Item>
    );
  }

  if (href) {
    return (
      <BootstrapDropdown.Item
        forwardedAs={(props) => (
          <Link
            variant={LinkVariants.BUTTON_NEUTRAL}
            href={href}
            padding={0}
            {...props}
          />
        )}
        css={`
          .btn {
            flex: 1;
            border: none;
            box-shadow: none !important;
            border-radius: 0 !important;

            &:hover {
              border-radius: 0 !important;
            }
          }
        `}
      >
        {children}
      </BootstrapDropdown.Item>
    );
  }

  return null;
};

const DividerLegacy = BootstrapDropdown.Divider;

export { DividerLegacy, DropdownLegacy, ItemLegacy };
