import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

type TextAreaProps = {
  name?: string;
  value?: string;
  rows?: number;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

type Props = Omit<BoxProps, 'onChange'> & TextAreaProps;

const BaseInput = forwardRef<HTMLTextAreaElement, Props>((props, ref) => (
  <Box as="textarea" {...props} ref={ref} />
));

BaseInput.displayName = 'BaseInput';

const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      id,
      className,
      onInput,
      value,
      disabled,
      rows,
      onChange,
      onBlur,
      name,
      ...props
    },
    ref,
  ) => {
    return (
      <Form.Control
        as={BaseInput}
        id={id}
        className={className}
        width="100%"
        minHeight="4rem"
        onInput={onInput}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        disabled={disabled}
        borderRadius={getGlobalBorderRadius}
        rows={rows}
        ref={ref}
        name={name}
        {...getBoxProps(props)}
      />
    );
  },
);

TextArea.displayName = 'TextArea';

TextArea.defaultProps = {
  disabled: false,
  rows: 3,
};

export { TextArea };
export type { TextAreaProps };
