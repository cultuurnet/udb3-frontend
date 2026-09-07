import type { ReactNode } from 'react';
import { Accordion as BootstrapAccordion } from 'react-bootstrap';

import { Stack } from './Stack';
import { colors } from './theme';
import { Title } from './Title';

type ItemProps = {
  title: string;
  children: ReactNode;
  eventKey: string;
  className?: string;
};

type Props = { children: ReactNode } & (
  | { multiple: true; defaultActiveKey?: string[] }
  | { multiple?: false; defaultActiveKey?: string }
);

function AccordionItem({ title, eventKey, children, className }: ItemProps) {
  return (
    <BootstrapAccordion.Item eventKey={eventKey}>
      <BootstrapAccordion.Header>
        <Title size={3}>{title}</Title>
      </BootstrapAccordion.Header>
      <BootstrapAccordion.Body>
        <Stack className={className}>{children}</Stack>
      </BootstrapAccordion.Body>
    </BootstrapAccordion.Item>
  );
}

function AccordionLegacy({ children, defaultActiveKey, multiple }: Props) {
  return (
    <BootstrapAccordion
      defaultActiveKey={defaultActiveKey}
      alwaysOpen={multiple}
      css={`
        width: 100%;
        .accordion-item {
          border: none;
          border-bottom: 1px solid ${colors.grey3};
          border-radius: 0;
        }
        .accordion-button,
        .accordion-body {
          padding-left: 0;
          padding-right: 0;
        }
        .accordion-button:not(.collapsed) {
          background-color: transparent;
          color: inherit;
          box-shadow: none;
        }
      `}
    >
      {children}
    </BootstrapAccordion>
  );
}

AccordionLegacy.Item = AccordionItem;

export { AccordionLegacy };
export type { ItemProps as AccordionItemProps };
