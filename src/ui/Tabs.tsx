import type { ReactNode } from 'react';
import { Children } from 'react';
import {
  Tab as BootstrapTab,
  Tabs as BootstrapTabs,
  TabsProps,
} from 'react-bootstrap';

import { Values } from '@/types/Values';
import type { BoxProps } from '@/ui/Box';
import { Box, getBoxProps, parseSpacing } from '@/ui/Box';

import { colors, getValueFromTheme } from './theme';

const getValue = getValueFromTheme(`tabs`);

export const TabsCustomVariants = {
  DEFAULT: 'default',
  OUTLINED: 'outlined',
} as const;

type Props<T> = BoxProps &
  TabsProps & {
    activeBackgroundColor?: string;
    customVariant?: Values<typeof TabsCustomVariants>;
  };

const Tabs = <T,>({
  activeKey,
  onSelect,
  activeBackgroundColor = 'white',
  customVariant = TabsCustomVariants.DEFAULT,
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
    default: `
    border-bottom: none;
  
    .nav-item:last-child {
      border-right: 1px solid ${getValue('borderColor')};
    }
  
    .nav-item {
      background-color: white;
      color: ${getValue('color')};
      border-radius: ${getValue('borderRadius')};
      padding: ${parseSpacing(3)} ${parseSpacing(4)};
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
    outlined: `
    border-bottom: none;
  .nav {
    margin-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .nav-item.nav-link {
    padding: 0.4rem 1rem;
    border: 1px solid black;
  }
  .nav-item {
    margin: 0 !important;
    border-radius: 0;
    background-color: white;

    &:hover {
      background-color: ${grey1};
    }

    &:first-child {
      border-right: none;
      border-radius: 0.5rem 0 0 0.5rem;
    }

    &:last-child {
      border-radius: 0 0.5rem 0.5rem 0;
    }

    &.active {
      color: white;
      background-color: ${udbMainDarkBlue};
    }

    &.active:hover {
      background-color: ${udbMainDarkBlue};
    }
  }
`,
  };

  return (
    <Box className={className} {...getBoxProps(props)}>
      <BootstrapTabs
        activeKey={activeKey}
        onSelect={onSelect}
        css={TabStyles[customVariant]}
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
