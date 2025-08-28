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
        &.custom-switch {
          font-size: 1rem;
          width: 2.5em;
          height: 1.3em;
          min-height: initial;
          padding: 0;
          margin: 0.2em;

          .custom-control-input {
            padding: 0;
            margin: 0;
          }

          .custom-control-label {
            font-size: 1em;
            width: 100%;
            height: 100%;

            padding: 0;
            margin: 0;
          }

          .custom-control-label::before {
            font-size: 1em;
            padding: 0;
            margin: 0;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 3rem;
          }

          .custom-control-input:focus ~ .custom-control-label::before {
            box-shadow: 0 0 0 0.2em rgb(0 123 255 / 25%);
          }

          .custom-control-input:checked ~ .custom-control-label::before {
            background-color: ${color};
            border-color: ${color};
          }

          .custom-control-input:disabled ~ .custom-control-label::before {
            filter: opacity(50%) grayscale(25%);
            cursor: not-allowed;
          }

          .custom-control-label::after {
            font-size: 1em;
            padding: 0;
            margin: 0;
            top: 0.2em;
            left: 0.2em;
            height: calc(1em - 0.1em);
            width: calc(1em - 0.1em);
            border-radius: calc(2rem - (1.5rem / 2));
          }

          .custom-control-input:checked ~ .custom-control-label::after {
            font-size: 1em;
            transform: initial;
            left: initial;
            right: 0.2em;
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
