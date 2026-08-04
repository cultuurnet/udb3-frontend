import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import { Box } from './Box';
import type { InputProps } from './Input';
import { cn } from './shadcn/utils';
import { getGlobalBorderRadius, getGlobalFormInputHeight } from './theme';

const BaseInput = forwardRef<HTMLInputElement, any>((props, ref) => (
  <Box as="input" {...props} ref={ref} />
));

BaseInput.displayName = 'BaseInput';

const InputLegacy = forwardRef<HTMLInputElement, InputProps>(
  (
    { onChange, type = 'text', isInvalid = false, className, ...props },
    ref,
  ) => (
    <Form.Control
      ref={ref}
      as={BaseInput}
      className={cn('tw:max-w-172', className)}
      height={`${getGlobalFormInputHeight}`}
      borderRadius={getGlobalBorderRadius}
      onInput={onChange}
      type={type}
      isInvalid={isInvalid}
      {...props}
    />
  ),
);

InputLegacy.displayName = 'InputLegacy';

export { InputLegacy };
