import { ChangeEvent } from 'react';

import { Box, BoxProps, getBoxProps } from './Box';
import { CheckboxVariants } from './Checkbox';
import { cn } from './shadcn/utils';

type CheckboxProps = BoxProps & {
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  variant?: CheckboxVariants;
};

const CheckboxLegacy = ({
  id,
  name = '',
  checked = false,
  disabled = false,
  onToggle = () => {},
  className,
  variant = CheckboxVariants.PRIMARY,
  ...props
}: CheckboxProps) => (
  <Box
    as="input"
    type="checkbox"
    id={id}
    name={name}
    checked={checked}
    disabled={disabled}
    onChange={onToggle}
    className={cn(
      variant === CheckboxVariants.SUCCESS
        ? 'tw:accent-success'
        : 'tw:accent-primary',
      className,
    )}
    cursor="pointer"
    data-testid={props['data-testid']}
    {...getBoxProps(props)}
  />
);

export { CheckboxLegacy };
