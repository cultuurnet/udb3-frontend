import type { ChangeEvent } from 'react';

import { RadioButtonLegacy, RadioButtonTypes } from './RadioButtonLegacy';
import { colors } from './theme';

type SwitchLegacyProps = {
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  color?: string;
  className?: string;
  'aria-label'?: string;
};

const SwitchLegacy = ({
  id,
  checked = false,
  disabled = false,
  onCheckedChange = () => {},
  color = colors.udbMainBlue,
  className,
  'aria-label': ariaLabel,
}: SwitchLegacyProps) => (
  <RadioButtonLegacy
    id={id}
    type={RadioButtonTypes.SWITCH}
    checked={checked}
    disabled={disabled}
    color={color}
    className={className}
    aria-label={ariaLabel}
    onChange={(event: ChangeEvent<HTMLInputElement>) =>
      onCheckedChange(event.target.checked)
    }
  />
);

export { SwitchLegacy };
export type { SwitchLegacyProps };
