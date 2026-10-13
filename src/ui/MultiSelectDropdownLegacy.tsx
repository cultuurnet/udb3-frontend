import { Dropdown as BootstrapDropdown } from 'react-bootstrap';

import { Box } from '@/ui/Box';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { cn } from '@/ui/shadcn/utils';
import {
  colors,
  getGlobalBorderRadius,
  getGlobalFormInputHeight,
} from '@/ui/theme';

import type { MultiSelectDropdownProps } from './MultiSelectDropdown';
import { getMultiSelectLabel } from './MultiSelectDropdown';

const MultiSelectDropdownLegacy = ({
  id,
  options,
  selectedValues,
  placeholder,
  onChange,
  hasError = false,
  className,
}: MultiSelectDropdownProps) => {
  const label = getMultiSelectLabel(options, selectedValues, placeholder);

  return (
    <BootstrapDropdown autoClose="outside">
      <BootstrapDropdown.Toggle
        className={cn('tw:w-45', className)}
        css={`
          display: flex;
          align-items: center;
          background-color: ${colors.white} !important;
          border: 1px solid ${hasError ? 'red' : colors.grey2} !important;
          border-radius: ${getGlobalBorderRadius} !important;
          height: ${getGlobalFormInputHeight};
          color: ${colors.textColor} !important;
          font-size: 1rem;
          padding: 0 0.75rem !important;
          box-shadow: none !important;
          gap: 0.5rem;

          &:hover,
          &:focus,
          &:active {
            background-color: ${colors.white} !important;
            border-color: ${hasError ? 'red' : colors.grey2} !important;
            color: ${colors.textColor} !important;
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
        renderOnMount
        popperConfig={{ strategy: 'fixed' }}
        className={cn('tw:w-45', className)}
        css={`
          padding: 0.25rem 0;
        `}
      >
        {options.map((option) => (
          <Box key={option.value} paddingX={3} paddingY={2}>
            <CheckboxWithLabel
              id={`${id}-${option.value}`}
              name={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((value) => value !== option.value),
                )
              }
            >
              {option.label}
            </CheckboxWithLabel>
          </Box>
        ))}
      </BootstrapDropdown.Menu>
    </BootstrapDropdown>
  );
};

export { MultiSelectDropdownLegacy };
