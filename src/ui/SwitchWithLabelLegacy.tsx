import type { ChangeEvent, ReactNode } from 'react';

import type { Values } from '@/types/Values';

import { RadioButtonTypes } from './RadioButtonLegacy';
import { RadioButtonWithLabelLegacy } from './RadioButtonWithLabelLegacy';
import { LEGACY_COLOR_BY_VARIANT, SwitchVariants } from './Switch';

type SwitchWithLabelLegacyProps = {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: Values<typeof SwitchVariants>;
  label?: ReactNode;
  className?: string;
};

const SwitchWithLabelLegacy = ({
  id,
  checked = false,
  disabled = false,
  onCheckedChange = () => {},
  variant = SwitchVariants.DEFAULT,
  label,
  className,
}: SwitchWithLabelLegacyProps) => (
  <RadioButtonWithLabelLegacy
    id={id}
    type={RadioButtonTypes.SWITCH}
    checked={checked}
    disabled={disabled}
    color={LEGACY_COLOR_BY_VARIANT[variant]}
    label={label}
    className={className}
    onChange={(event: ChangeEvent<HTMLInputElement>) =>
      onCheckedChange(event.target.checked)
    }
  />
);

export { SwitchWithLabelLegacy };
export type { SwitchWithLabelLegacyProps };
