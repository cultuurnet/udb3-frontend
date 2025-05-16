import { ChangeEvent } from 'react';
import { Box, BoxProps, getBoxProps } from './Box';

type CheckboxProps = BoxProps & {
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const Checkbox = ({
  id,
  name = '',
  checked = false,
  disabled = false,
  onToggle = () => {},
  className,
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
    className={className}
    cursor="pointer"
    data-testid={props['data-testid']}
    {...getBoxProps(props)}
  />
);

export { Checkbox };
