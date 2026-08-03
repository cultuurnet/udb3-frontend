import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import { Box } from './Box';
import type { InputProps } from './Input';
import { getGlobalBorderRadius, getGlobalFormInputHeight } from './theme';

const BaseInput = forwardRef<HTMLInputElement, any>((props, ref) => (
  <Box as="input" {...props} ref={ref} />
));

BaseInput.displayName = 'BaseInput';

const InputLegacy = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, type = 'text', isInvalid = false, ...props }, ref) => (
    <Form.Control
      ref={ref}
      as={BaseInput}
      maxWidth="43rem"
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
