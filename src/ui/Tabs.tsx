import type { ReactNode } from 'react';
import { Children } from 'react';
import {
  Tab as BootstrapTab,
  Tabs as BootstrapTabs,
  TabsProps,
} from 'react-bootstrap';
import { css } from 'styled-components';

import { Values } from '@/types/Values';
import type { BoxProps } from '@/ui/Box';
import { Box, getBoxProps } from '@/ui/Box';

import { colors, getValueFromTheme } from './theme';

const getValue = getValueFromTheme(`tabs`);

export const TabsVariants = {
  DEFAULT: 'default',
  OUTLINED: 'outlined',
} as const;

type Props<T> = BoxProps &
  Omit<TabsProps, 'variant'> & {
    activeBackgroundColor?: string;
    variant?: Values<typeof TabsVariants>;
  };

const Tabs = <T,>({
  activeKey,
  onSelect,
  activeBackgroundColor = 'white',
  variant = TabsVariants.DEFAULT,
  children: rawChildren,
  className,
  ...props
}: Props<T>) => {
  const children = Children.toArray(rawChildren).filter((child) => {
    // @ts-expect-error
    if (child.type !== Tab) {
      // eslint-disable-next-line no-console
      console.error(
        'Child of type',
        // @ts-expect-error
        child.type.name,
        'is not supported in Tabs component',
      );
      return false;
    }

    return true;
  });

  const { udbMainDarkBlue, grey1 } = colors;
  const TabStyles = {
    default: css`
      border-bottom: none;

      .nav-link:last-child {
        border-right: 1px solid ${getValue('borderColor')};
      }

      .nav-link {
        background-color: white;
        color: ${getValue('color')};
        border-radius: ${getValue('borderRadius')};
        border-color: ${getValue('borderColor')};
        border-right: none;

        &.nav-link {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        &.active {
          background-color: ${activeBackgroundColor};
          border-bottom-color: ${getValue('activeTabBackgroundColor')};
          cursor: default;
          border-bottom: transparent;
        }

        &:hover {
          color: ${getValue('hoverColor')};
          border-color: transparent;
          background-color: ${getValue('hoverTabBackgroundColor')};
        }
      }
    `,
    outlined: css`
      border-bottom: none;
      .nav {
        margin-left: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .nav-link {
        color: ${getValue('color')};
        padding: 0.4rem 1rem;
        border: 1px solid black;
        margin: 0 !important;
        background-color: white;

        &:hover {
          background-color: ${grey1};
          border: 1px solid black;
        }

        &.active {
          color: white;
          background-color: ${udbMainDarkBlue};
          border: 1px solid black;
        }

        &.active:hover {
          background-color: ${udbMainDarkBlue};
        }
      }

      .nav-item:first-child .nav-link {
        border-radius: 0.5rem 0 0 0.5rem;
        border-right: none;
      }

      .nav-item:last-child .nav-link {
        border-radius: 0 0.5rem 0.5rem 0;
      }

      .nav-item:first-child .nav-link.active {
        border-right: none;
      }
    `,
  };

  return (
    <Box className={className} {...getBoxProps(props)}>
      <BootstrapTabs
        activeKey={activeKey}
        onSelect={onSelect}
        css={TabStyles[variant]}
      >
        {children}
      </BootstrapTabs>
    </Box>
  );
};

type TabProps = {
  eventKey: string;
  title: ReactNode;
  children?: ReactNode;
};

const Tab = ({ eventKey, title, children }: TabProps) => {
  return (
    <BootstrapTab eventKey={eventKey} title={title}>
      {children}
    </BootstrapTab>
  );
};

Tabs.Tab = Tab;

export { Tabs };
