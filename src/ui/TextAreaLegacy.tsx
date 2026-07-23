import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { getGlobalBorderRadius } from './theme';

type TextAreaLegacyProps = {
  name?: string;
  value?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
};

type Props = Omit<BoxProps, 'onChange' | 'onBlur'> & TextAreaLegacyProps;

const BaseInput = forwardRef<HTMLTextAreaElement, Props>((props, ref) => (
  <Box as="textarea" {...(props as unknown as BoxProps)} ref={ref} />
));

BaseInput.displayName = 'BaseInput';

const TextAreaLegacy = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      id,
      className,
      onInput,
      value,
      disabled = false,
      rows = 3,
      placeholder,
      required = false,
      onChange,
      onBlur,
      name,
      'aria-label': ariaLabel,
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
        onBlur={(event) =>
          onBlur?.(event as unknown as ChangeEvent<HTMLTextAreaElement>)
        }
        value={value}
        disabled={disabled}
        borderRadius={getGlobalBorderRadius}
        rows={rows}
        placeholder={placeholder}
        required={required}
        ref={ref}
        name={name}
        aria-label={ariaLabel}
        {...getBoxProps(props)}
      />
    );
  },
);

TextAreaLegacy.displayName = 'TextAreaLegacy';

export { TextAreaLegacy };
export type { TextAreaLegacyProps };
