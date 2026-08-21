import { ChangeEvent, ReactNode } from 'react';

import { CheckboxLegacy } from './CheckboxLegacy';
import { getInlineProps, Inline, InlineProps } from './Inline';
import { LabelLegacy } from './LabelLegacy';

type CheckboxWithLabelProps = InlineProps & {
  className?: string;
  id: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (event: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
};

const CheckboxWithLabelLegacy = ({
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
      <CheckboxLegacy
        id={id}
        onToggle={onToggle}
        name={name}
        checked={checked}
        disabled={disabled}
      />
      <LabelLegacy cursor={disabled ? 'not-allowed' : 'pointer'} htmlFor={id}>
        {children}
      </LabelLegacy>
    </Inline>
  );
};

export { CheckboxWithLabelLegacy };
