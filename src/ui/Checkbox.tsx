import { getBoxProps, Box } from './Box';
import type { BoxProps } from './Box';

type Props = BoxProps & {
  onToggle?: () => void;
};

const Checkbox = ({
  id,
  name,
  checked,
  disabled,
  onToggle,
  className,
  ...props
}: Props) => (
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

Checkbox.defaultprops = {
  name: '',
  checked: false,
  disabled: false,
  onToggle: () => {},
};

export { Checkbox };
