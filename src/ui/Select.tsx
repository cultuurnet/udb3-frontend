import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

type SelectProps = {
  id?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  size?: 'sm' | 'lg';
  ariaLabel?: string;
  value?: string;
};

type Props = Omit<BoxProps, 'onChange'> & SelectProps;

const Select = forwardRef<HTMLSelectElement, Props>(
  (
    {
      id,
      onChange,
      className,
      value,
      size,
      children,
      ariaLabel,
      maxWidth,
      ...props
    },
    ref,
  ) => (
    <Box
      {...getBoxProps(props)}
      maxWidth={maxWidth}
      borderRadius={getGlobalBorderRadius}
    >
      <Form.Select
        ref={ref}
        size={size}
        id={id}
        className={className}
        onChange={onChange}
        value={value}
        aria-label={ariaLabel}
      >
        {children}
      </Form.Select>
    </Box>
  ),
);

Select.displayName = 'Select';

export { Select };
export type { Props as SelectProps };
