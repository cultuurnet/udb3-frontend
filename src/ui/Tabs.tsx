import {
  Children,
  CSSProperties,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from '@/ui/shadcn/tabs';

import { TabsLegacy, TabsVariants } from './TabsLegacy';

type TabProps = {
  eventKey: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

type Props<T extends string = string> = {
  activeKey: string;
  onSelect?: (key: T | null) => void;
  activeBackgroundColor?: string;
  variant?: Values<typeof TabsVariants>;
  compact?: boolean;
  children?: ReactNode;
  className?: string;
};

const getActiveStyle = (
  shadcnVariant: 'default' | 'line' | 'outlined',
  color: string,
): CSSProperties =>
  shadcnVariant === 'line'
    ? { color, borderBottomColor: color }
    : { backgroundColor: color };

const variantMap: Record<
  Values<typeof TabsVariants>,
  'default' | 'line' | 'outlined'
> = {
  [TabsVariants.DEFAULT]: 'default',
  [TabsVariants.FLOATING]: 'line',
  [TabsVariants.OUTLINED]: 'outlined',
};

function TabsShadcn<T extends string = string>({
  activeKey,
  onSelect,
  activeBackgroundColor,
  variant = TabsVariants.DEFAULT,
  compact,
  children,
  className,
}: Props<T>) {
  const tabs = Children.toArray(children)
    .filter(
      (child): child is ReactElement<TabProps> =>
        isValidElement(child) && child.type === Tabs.Tab,
    )
    .map((child) => child.props);

  const shadcnVariant = variantMap[variant];

  return (
    <ShadcnTabs
      value={activeKey}
      onValueChange={(v) => onSelect?.(v as T)}
      className={className}
    >
      <ShadcnTabsList variant={shadcnVariant}>
        {tabs.map((tab) => (
          <ShadcnTabsTrigger
            key={tab.eventKey}
            value={tab.eventKey}
            variant={shadcnVariant}
            size={compact ? 'sm' : 'md'}
            {...(activeBackgroundColor &&
              tab.eventKey === activeKey && {
                style: getActiveStyle(shadcnVariant, activeBackgroundColor),
              })}
          >
            {tab.title}
          </ShadcnTabsTrigger>
        ))}
      </ShadcnTabsList>
      {tabs.map((tab) => (
        <ShadcnTabsContent
          key={tab.eventKey}
          value={tab.eventKey}
          className={tab.className}
          forceMount
        >
          {tab.children}
        </ShadcnTabsContent>
      ))}
    </ShadcnTabs>
  );
}

TabsShadcn.Tab = TabsLegacy.Tab;

function Tabs<T extends string = string>(props: Props<T>) {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );
  return isShadcnMigrationEnabled ? (
    <TabsShadcn {...props} />
  ) : (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <TabsLegacy {...(props as any)} />
  );
}

Tabs.Tab = TabsLegacy.Tab;

export { Tabs, TabsVariants };
export type { TabProps };
