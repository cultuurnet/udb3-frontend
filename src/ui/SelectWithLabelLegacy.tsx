import type { Values } from '@/types/Values';

import { FormElement } from './FormElement';
import type { LabelPositions } from './Label';
import type { SelectProps } from './Select';
import { SelectLegacy } from './SelectLegacy';

type Props = SelectProps & {
  id: string;
  label: string;
  labelPosition: Values<typeof LabelPositions>;
};

const SelectWithLabelLegacy = ({
  id,
  name,
  label,
  onChange,
  onBlur,
  className,
  value,
  size,
  disabled,
  children,
  ariaLabel,
  labelPosition,
}: Props) => {
  return (
    <FormElement
      className={className}
      Component={
        <SelectLegacy
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          ariaLabel={ariaLabel}
          size={size}
          disabled={disabled}
        >
          {children}
        </SelectLegacy>
      }
      id={id}
      label={label}
      labelPosition={labelPosition}
    />
  );
};

export { SelectWithLabelLegacy };
