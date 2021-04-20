import { getStackProps, Stack } from './Stack';
import type { StackProps } from './Stack';

import { Inline } from './Inline';
import { Box, parseSpacing } from './Box';
import { getValueFromTheme } from './theme';
import { css } from 'styled-components';

const getValue = getValueFromTheme('detailTable');

type Props = StackProps & {
  items?: Array<{ header: string; value: string }>;
};

const DetailTable = ({ items, className, ...props }: Props) => {
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
                    border-bottom: 1px solid ${getValue<string>('borderColor')};
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

DetailTable.defaultProps = {
  items: [],
};

export { DetailTable };
