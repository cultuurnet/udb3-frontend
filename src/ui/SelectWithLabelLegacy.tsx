import type { Values } from '@/types/Values';

import { FormElement } from './FormElement';
import type { LabelPositions } from './Label';
import type { SelectProps } from './Select';
import { SelectLegacy } from './SelectLegacy';

type Props = SelectProps & {
  label: string;
  labelPosition: Values<typeof LabelPositions>;
};

const SelectWithLabelLegacy = ({
  id,
  label,
  onChange,
  className,
  value,
  size,
  children,
  ariaLabel,
  labelPosition,
}: Props) => {
  return (
    <FormElement
      className={className}
      Component={
        <SelectLegacy
          onChange={onChange}
          value={value}
          ariaLabel={ariaLabel}
          size={size}
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
