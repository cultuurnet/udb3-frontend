import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

type SelectProps = {
  id?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  value?: string;
};

type Props = Omit<BoxProps, 'onChange' | 'size' | 'onBlur'> & SelectProps;

const SelectLegacy = forwardRef<HTMLSelectElement, Props>(
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
      className={className}
      maxWidth={maxWidth}
      borderRadius={getGlobalBorderRadius}
    >
      <Form.Select
        ref={ref}
        size={size === 'md' ? undefined : size}
        id={id}
        onChange={onChange}
        value={value}
        aria-label={ariaLabel}
      >
        {children}
      </Form.Select>
    </Box>
  ),
);

SelectLegacy.displayName = 'SelectLegacy';

export { SelectLegacy };
export type { Props as SelectProps };
