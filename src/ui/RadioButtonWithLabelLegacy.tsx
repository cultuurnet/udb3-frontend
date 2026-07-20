import React, { ReactNode, Ref } from 'react';

import { BoxProps } from './Box';
import { getInlineProps, Inline } from './Inline';
import { Label } from './Label';
import type { RadioButtonLegacyProps } from './RadioButtonLegacy';
import { RadioButtonLegacy } from './RadioButtonLegacy';
import { Stack } from './Stack';
import { Text, TextVariants } from './Text';
import { colors } from './theme';

type Props = RadioButtonLegacyProps &
  Omit<BoxProps, 'onChange'> & {
    info?: string;
    label?: ReactNode;
  };

const RadioButtonWithLabelLegacy = React.forwardRef(
  (
    {
      id,
      name,
      disabled,
      onChange,
      label,
      info,
      value,
      className,
      checked,
      type,
      color,
      ...props
    }: Props,
    ref: Ref<HTMLElement>,
  ) => {
    return (
      <Inline
        className={className}
        alignItems={info ? 'flex-start' : 'center'}
        spacing={3}
        as="li"
        ref={ref}
        {...getInlineProps(props)}
      >
        <RadioButtonLegacy
          id={id}
          type={type}
          onChange={onChange}
          disabled={disabled}
          value={value}
          name={name}
          checked={checked}
          color={color}
        />
        <Stack>
          <Label
            cursor={disabled ? 'not-allowed' : 'pointer'}
            color={disabled ? colors.grey5 : undefined}
            htmlFor={id}
          >
            {label}
          </Label>
          {!!info && <Text variant={TextVariants.MUTED}>{info}</Text>}
        </Stack>
      </Inline>
    );
  },
);

RadioButtonWithLabelLegacy.displayName = 'RadioButtonWithLabelLegacy';

export { RadioButtonWithLabelLegacy };
