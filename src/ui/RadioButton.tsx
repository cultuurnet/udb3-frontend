import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

import { Values } from '@/types/Values';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import { colors } from './theme';

const BaseRadioButton = forwardRef<HTMLInputElement, any>((props, ref) => (
  <Box as="input" {...props} ref={ref} />
));

BaseRadioButton.displayName = 'RadioButton';

const RadioButtonTypes = {
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
} as const;

type RadioButtonProps = {
  type?: Values<typeof RadioButtonTypes>;
  id?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  isValid?: boolean;
  checked?: boolean;
  color?: string;
};

type Props = Omit<BoxProps, 'onChange'> & RadioButtonProps;

const RadioButton = forwardRef<HTMLInputElement, Props>(
  (
    {
      type = 'radio',
      id,
      onChange,
      className,
      value,
      name,
      disabled = false,
      isInvalid = false,
      isValid,
      checked = false,
      color = colors.udbMainBlue,
      ...props
    },
    ref,
  ) => (
    <Form.Check
      ref={ref}
      forwardedAs={BaseRadioButton}
      id={id}
      type={type}
      className={className}
      onChange={onChange}
      value={value}
      name={name}
      isInvalid={isInvalid}
      isValid={isValid}
      disabled={disabled}
      checked={checked}
      css={`
        &.form-switch {
          font-size: 1rem;
          width: 2.5em;
          height: 1.3em;
          padding: 0;
          margin: 0.2em;

          .form-check-input {
            width: 2.5em;
            height: 1.3em;
            margin: 0;
            cursor: pointer;

            &:checked {
              background-color: ${color};
              border-color: ${color};
            }
            &:focus {
            border-color: ${color};
          }

          .form-check-input:focus {
            box-shadow: 0 0 0 0.2em rgb(0 123 255 / 25%);
          }

          .form-check-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .form-check-label {
            font-size: 1em;
            margin-left: 0.5em;
            cursor: pointer;
          }
        }
      `}
      {...getBoxProps(props)}
    />
  ),
);

RadioButton.displayName = 'RadioButton';

export { RadioButton, RadioButtonTypes };
export type { RadioButtonProps };
