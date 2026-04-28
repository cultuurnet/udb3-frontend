import 'react-bootstrap-typeahead/css/Typeahead.css';

import { forwardRef, useState } from 'react';
import { Typeahead, type TypeaheadRef } from 'react-bootstrap-typeahead';

import { Box } from './Box';
import {
  getGlobalBorderRadius,
  getGlobalFormInputHeight,
  getValueFromTheme,
} from './theme';

const getValue = getValueFromTheme('typeahead');

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
};

const TypeaheadInput = forwardRef<TypeaheadRef, Props>(
  ({ id, value, onChange, placeholder, suggestions = [] }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasMatches = value
      ? suggestions.some((s) => s.toLowerCase().includes(value.toLowerCase()))
      : suggestions.length > 0;

    return (
      <Box
        width="100%"
        css={`
          .form-control {
            border-radius: ${getGlobalBorderRadius};
            height: ${getGlobalFormInputHeight};
            padding: 0.375rem 0.9rem;
          }

          .dropdown-item {
            border-bottom: 1px solid ${({ theme }) => theme.colors.grey1};
          }

          .dropdown-item.active,
          .dropdown-item:active {
            color: ${getValue('active.color')};
            background-color: ${getValue('active.backgroundColor')};
          }

          .dropdown-item.hover,
          .dropdown-item:hover {
            color: ${getValue('hover.color')};
            background-color: ${getValue('hover.backgroundColor')};
          }
        `}
      >
        <Typeahead
          ref={ref}
          id={id ?? 'faq-question'}
          minLength={0}
          open={isFocused && hasMatches}
          options={suggestions}
          selected={value ? [value] : []}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInputChange={(text) => {
            onChange(text);
            setIsFocused(true);
          }}
          onChange={(selected) => {
            if (selected.length) {
              onChange(String(selected[0]));
              setIsFocused(false);
            }
          }}
        />
      </Box>
    );
  },
);

TypeaheadInput.displayName = 'TypeaheadInput';

export { TypeaheadInput };
