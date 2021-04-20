import { getBoxProps, Box } from './Box';
import type { BoxProps } from './Box';

type Props = BoxProps;

const RadioButton = ({
  id,
  name,
  disabled,
  onChange,
  value,
  checked,
  className,
  ...props
}: Props) => {
  return (
    <Box
      as="input"
      type="radio"
      id={id}
      name={name}
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      value={value}
      className={className}
      cursor="pointer"
      {...getBoxProps(props)}
    />
  );
};

const radioButtonDefaultProps = {
  disabled: false,
};

RadioButton.defaultprops = {
  ...radioButtonDefaultProps,
};

export { RadioButton, radioButtonDefaultProps };
