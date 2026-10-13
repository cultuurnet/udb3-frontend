import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  Accordion as ShadcnAccordion,
  AccordionContent as ShadcnAccordionContent,
  AccordionItem as ShadcnAccordionItem,
  AccordionTrigger as ShadcnAccordionTrigger,
} from '@/ui/shadcn/accordion';

import { type AccordionItemProps, AccordionLegacy } from './AccordionLegacy';

type Props = { children: ReactNode } & (
  | { multiple: true; defaultActiveKey?: string[] }
  | { multiple?: false; defaultActiveKey?: string }
);

const flattenFragments = (children: ReactNode): ReactNode[] =>
  Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenFragments(child.props.children)
      : [child],
  );

function AccordionShadcn(props: Props) {
  const { children } = props;
  const itemsJsx = flattenFragments(children)
    .filter(
      (child): child is ReactElement<AccordionItemProps> =>
        isValidElement(child) && child.type === Accordion.Item,
    )
    .map(
      ({ props: { eventKey, title, children: itemChildren, className } }) => (
        <ShadcnAccordionItem key={eventKey} value={eventKey}>
          <ShadcnAccordionTrigger className="tw:text-base tw:font-bold">
            {title}
          </ShadcnAccordionTrigger>
          <ShadcnAccordionContent className={className}>
            {itemChildren}
          </ShadcnAccordionContent>
        </ShadcnAccordionItem>
      ),
    );

  if (props.multiple === true) {
    return (
      <ShadcnAccordion
        type="multiple"
        defaultValue={props.defaultActiveKey}
        className="tw:w-full"
      >
        {itemsJsx}
      </ShadcnAccordion>
    );
  }

  return (
    <ShadcnAccordion
      type="single"
      collapsible
      defaultValue={props.defaultActiveKey}
      className="tw:w-full"
    >
      {itemsJsx}
    </ShadcnAccordion>
  );
}

function Accordion(props: Props) {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );
  const { children } = props;

  if (props.multiple === true) {
    return isShadcnMigrationEnabled ? (
      <AccordionShadcn multiple defaultActiveKey={props.defaultActiveKey}>
        {children}
      </AccordionShadcn>
    ) : (
      <AccordionLegacy multiple defaultActiveKey={props.defaultActiveKey}>
        {children}
      </AccordionLegacy>
    );
  }

  return isShadcnMigrationEnabled ? (
    <AccordionShadcn defaultActiveKey={props.defaultActiveKey}>
      {children}
    </AccordionShadcn>
  ) : (
    <AccordionLegacy defaultActiveKey={props.defaultActiveKey}>
      {children}
    </AccordionLegacy>
  );
}

Accordion.Item = AccordionLegacy.Item;

export { Accordion };
