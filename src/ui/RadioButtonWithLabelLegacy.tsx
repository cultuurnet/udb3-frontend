import React, { ReactNode, Ref } from 'react';

import { BoxProps } from './Box';
import { getInlineProps, Inline } from './Inline';
import { Label } from './Label';
import type { RadioButtonLegacyProps } from './RadioButtonLegacy';
import { RadioButtonLegacy } from './RadioButtonLegacy';
import { cn } from './shadcn/utils';
import { Text, TextVariants } from './Text';

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
        <div className="tw:flex tw:flex-col">
          <Label
            className={cn(
              disabled
                ? 'tw:cursor-not-allowed tw:text-muted-foreground'
                : 'tw:cursor-pointer',
            )}
            htmlFor={id}
          >
            {label}
          </Label>
          {!!info && <Text variant={TextVariants.MUTED}>{info}</Text>}
        </div>
      </Inline>
    );
  },
);

RadioButtonWithLabelLegacy.displayName = 'RadioButtonWithLabelLegacy';

export { RadioButtonWithLabelLegacy };
