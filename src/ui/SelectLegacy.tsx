import type { ChangeEvent, FocusEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

type SelectProps = {
  id?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  value?: string;
  disabled?: boolean;
};

type Props = Omit<BoxProps, 'onChange' | 'size' | 'onBlur' | 'disabled'> &
  SelectProps;

const SelectLegacy = forwardRef<HTMLSelectElement, Props>(
  (
    {
      id,
      name,
      onChange,
      onBlur,
      className,
      value,
      size,
      children,
      ariaLabel,
      maxWidth,
      disabled,
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
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </Form.Select>
    </Box>
  ),
);

SelectLegacy.displayName = 'SelectLegacy';

export { SelectLegacy };
