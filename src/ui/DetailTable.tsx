import type { ReactNode } from 'react';
import { css } from 'styled-components';

import { Box, parseSpacing } from './Box';
import { Inline } from './Inline';
import type { StackProps } from './Stack';
import { getStackProps, Stack } from './Stack';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('detailTable');

type Item = {
  header: ReactNode;
  value: ReactNode;
};

type Props = StackProps & {
  items?: Item[];
  className?: string;
};

const DetailTable = ({ items = [], className, ...props }: Props) => {
  return (
    <Stack
      as="table"
      backgroundColor={getValue('backgroundColor')}
      className={className}
      {...getStackProps(props)}
    >
      <Stack as="tbody">
        {items.map(({ header, value }, index) => (
          <Inline
            key={index}
            forwardedAs="tr"
            padding={3}
            css={
              index !== items.length - 1
                ? css`
                    border-bottom: 1px solid ${getValue('borderColor')};
                  `
                : css``
            }
          >
            <Box as="th" minWidth={parseSpacing(7)()} fontWeight="bold">
              {header}
            </Box>
            <Box as="td">{value}</Box>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
};

export { DetailTable };
