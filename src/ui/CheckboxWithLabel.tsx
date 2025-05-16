import { ChangeEvent, ReactNode } from 'react';

import { Checkbox } from './Checkbox';
import { getInlineProps, Inline } from './Inline';
import { Label } from './Label';

interface CheckboxWithLabelProps {
  className?: string;
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (event: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}

const CheckboxWithLabel = ({
  id,
  name = '',
  checked = false,
  disabled = false,
  onToggle = () => {},
  children,
  className = '',
  ...props
}: CheckboxWithLabelProps) => {
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

export { CheckboxWithLabel };
