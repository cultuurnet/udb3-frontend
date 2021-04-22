import { Label, LabelVariants } from './Label';
import { getInlineProps, Inline } from './Inline';
import { Input } from './Input';

import type { BoxProps } from './Box';
import type { InputProps } from './Input';

type Props = BoxProps &
  InputProps & {
    label: string;
  };

const InputWithLabel = ({
  type,
  id,
  label,
  placeholder,
  className,
  value,
  onInput,
  ...props
}: Props) => (
  <Inline
    className={className}
    as="div"
    spacing={3}
    alignItems="center"
    {...getInlineProps(props)}
  >
    <Label htmlFor={id} variant={LabelVariants.BOLD}>
      {label}
    </Label>
    <Input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onInput={onInput}
    />
  </Inline>
);

InputWithLabel.defaultProps = {
  type: 'text',
};

export { InputWithLabel };
