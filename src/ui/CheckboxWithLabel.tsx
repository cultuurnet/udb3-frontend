import { Checkbox } from './Checkbox';

import { getInlineProps, Inline } from './Inline';
import type { InlineProps } from './Inline';

import { Label } from './Label';

type Props = InlineProps & {
  onToggle?: () => void;
  children: React.ReactNode;
};

const CheckboxWithLabel = ({
  id,
  name,
  checked,
  disabled,
  onToggle,
  children,
  className,
  ...props
}: Props) => {
  return (
    <Inline
      as="div"
      className={className}
      alignItems="center"
      spacing={3}
      {...getInlineProps(props)}
    >
      <Checkbox
        id={id}
        onToggle={onToggle}
        name={name}
        checked={checked}
        disabled={disabled}
      />
      <Label cursor="pointer" htmlFor={id}>
        {children}
      </Label>
    </Inline>
  );
};

CheckboxWithLabel.defaultprops = {
  name: '',
  checked: false,
  disabled: false,
  onToggle: () => {},
};

export { CheckboxWithLabel };
