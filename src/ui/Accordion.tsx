import type { ReactNode } from 'react';
import { Accordion as BootstrapAccordion } from 'react-bootstrap';

import { Stack, type StackProps } from './Stack';
import { colors } from './theme';

type ItemProps = {
  title: string;
  children: ReactNode;
  eventKey: string;
} & StackProps;

type Props = {
  children: ReactNode;
};

function AccordionItem({
  title,
  eventKey,
  children,
  ...stackProps
}: ItemProps) {
  return (
    <BootstrapAccordion.Item eventKey={eventKey}>
      <BootstrapAccordion.Header>
        <strong>{title}</strong>
      </BootstrapAccordion.Header>
      <BootstrapAccordion.Body>
        <Stack {...stackProps}>{children}</Stack>
      </BootstrapAccordion.Body>
    </BootstrapAccordion.Item>
  );
}

function Accordion({ children }: Props) {
  return (
    <Stack
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
      as={BootstrapAccordion}
    >
      {children}
    </Stack>
  );
}

Accordion.Item = AccordionItem;

export { Accordion };
