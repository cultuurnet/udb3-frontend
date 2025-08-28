import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

const BaseSelect = forwardRef<HTMLSelectElement, any>((props, ref) => (
  <Box as="select" {...props} ref={ref} />
));

BaseSelect.displayName = 'BaseSelect';

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
    <Form.Select
      as={BaseSelect}
      size={size}
      ref={ref}
      id={id}
      className={className}
      onChange={onChange}
      value={value}
      aria-label={ariaLabel}
      borderRadius={getGlobalBorderRadius}
      maxtWidth={maxWidth}
      {...getBoxProps(props)}
    >
      {children}
    </Form.Select>
  ),
);

Select.displayName = 'Select';

export { Select };
export type { Props as SelectProps };
