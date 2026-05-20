import {
  ToggleButton as BootstrapToggleButton,
  ToggleButtonGroup as BootstrapToggleButtonGroup,
} from 'react-bootstrap';

import type { Values } from '@/types/Values';

import { getStackProps, Stack, StackProps } from './Stack';
import { colors, getValueFromTheme } from './theme';

const getGlobalValue = getValueFromTheme('global');

const ToggleGroupVariants = {
  UNSTYLED: 'unstyled',
} as const;

type ToggleGroupVariant = Values<typeof ToggleGroupVariants>;

type ToggleGroupOption = {
  value: string;
  label: string;
};

type Props = Omit<StackProps, 'onChange' | 'options' | 'value' | 'name'> & {
  name: string;
  value: string;
  options: ToggleGroupOption[];
  onChange: (value: string) => void;
  variant?: ToggleGroupVariant;
};

const ToggleGroup = ({
  name,
  value,
  options,
  onChange,
  className,
  variant = ToggleGroupVariants.UNSTYLED,
  ...props
}: Props) => (
  <Stack className={className} {...getStackProps(props)}>
    <BootstrapToggleButtonGroup
      type="radio"
      name={name}
      value={value}
      onChange={onChange}
      css={`
        background-color: ${colors.grey4};
        border-radius: 0.625rem;

        > .btn {
          flex: 1 1 0;
          background-color: transparent;
          border-radius: 0 !important;
          color: ${colors.grey5};
          box-shadow: none;
          padding: 0.5rem 1rem;
          position: relative;
          transition:
            background-color 120ms ease,
            color 120ms ease,
            box-shadow 120ms ease;

          &:hover {
            background-color: transparent;
            color: ${colors.textColor};
          }
        }

        > .btn-check:checked + .btn {
          background-color: ${colors.white};
          border-color: transparent;
          border-radius: 0.625rem !important;
          color: ${colors.textColor};
          box-shadow: ${getGlobalValue('boxShadow.heavy')};
          z-index: 1;
        }
      `}
    >
      {options.map((toggleOption) => (
        <BootstrapToggleButton
          key={toggleOption.value}
          id={`${name}-${toggleOption.value}`}
          value={toggleOption.value}
          variant={variant}
        >
          {toggleOption.label}
        </BootstrapToggleButton>
      ))}
    </BootstrapToggleButtonGroup>
  </Stack>
);

export type { ToggleGroupOption };
export { ToggleGroup, ToggleGroupVariants };
