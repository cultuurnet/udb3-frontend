import { Dropdown as BootstrapDropdown } from 'react-bootstrap';

import { Box } from '@/ui/Box';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import {
  colors,
  getGlobalBorderRadius,
  getGlobalFormInputHeight,
} from '@/ui/theme';

type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectDropdownProps = {
  id: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  placeholder: string;
  onChange: (value: string, checked: boolean) => void;
};

const MultiSelectDropdown = ({
  id,
  options,
  selectedValues,
  placeholder,
  onChange,
}: MultiSelectDropdownProps) => {
  const label =
    selectedValues.length === 0
      ? placeholder
      : options
          .filter((opt) => selectedValues.includes(opt.value))
          .map((opt) => opt.label)
          .join(', ');

  return (
    <BootstrapDropdown autoClose="outside">
      <BootstrapDropdown.Toggle
        css={`
          display: flex;
          align-items: center;
          width: 175px;
          background-color: white !important;
          border: 1px solid ${colors.grey2} !important;
          border-radius: ${getGlobalBorderRadius} !important;
          height: ${getGlobalFormInputHeight};
          color: #212529 !important;
          font-size: 1rem;
          padding: 0 0.75rem !important;
          box-shadow: none !important;
          gap: 0.5rem;

          &:hover,
          &:focus,
          &:active {
            background-color: white !important;
            border-color: ${colors.grey2} !important;
            color: #212529 !important;
          }

          &::after {
            flex-shrink: 0;
            margin-left: auto;
          }
        `}
      >
        <span
          css={`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
            flex: 1;
            text-align: left;
          `}
        >
          {label}
        </span>
      </BootstrapDropdown.Toggle>
      <BootstrapDropdown.Menu
        css={`
          min-width: 175px;
          padding: 0.25rem 0;
        `}
      >
        {options.map((option) => (
          <Box key={option.value} paddingX={3} paddingY={2}>
            <CheckboxWithLabel
              id={`${id}-${option.value}`}
              name={option.value}
              checked={selectedValues.includes(option.value)}
              onToggle={(e) => onChange(option.value, e.target.checked)}
            >
              {option.label}
            </CheckboxWithLabel>
          </Box>
        ))}
      </BootstrapDropdown.Menu>
    </BootstrapDropdown>
  );
};

export { MultiSelectDropdown };
export type { MultiSelectDropdownProps, MultiSelectOption };
