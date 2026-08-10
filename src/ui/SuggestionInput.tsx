import type { ReactNode } from 'react';
import { forwardRef, Fragment, useState } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { CommandPopover } from '@/ui/CommandPopover';
import { Highlighter } from '@/ui/Highlighter';
import { Icon, Icons } from '@/ui/Icon';
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@/ui/shadcn/command';

import { TypeaheadInputLegacy } from './TypeaheadInputLegacy';

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  'aria-label'?: string;
  icon?: ReactNode;
};

const SuggestionInputShadcn = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      value,
      onChange,
      placeholder,
      suggestions = [],
      'aria-label': ariaLabel,
      icon = <Icon name={Icons.SEARCH} />,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const filteredSuggestions = value
      ? suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()),
        )
      : suggestions;

    const hasMatches = filteredSuggestions.length > 0;

    return (
      <CommandPopover
        open={isFocused && hasMatches}
        onOpenChange={(open) => !open && setIsFocused(false)}
        input={
          <CommandInput
            ref={ref}
            id={id}
            value={value}
            onValueChange={(text) => {
              onChange(text);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="tw:text-base"
            icon={icon}
          />
        }
      >
        <CommandGroup className="tw:p-0">
          {filteredSuggestions.map((suggestion, index) => (
            <Fragment key={suggestion}>
              <CommandItem
                value={suggestion}
                onSelect={() => {
                  onChange(suggestion);
                  setIsFocused(false);
                }}
                className="tw:text-base tw:rounded-none tw:cursor-pointer"
              >
                <Highlighter search={value}>{suggestion}</Highlighter>
              </CommandItem>
              {index < filteredSuggestions.length - 1 && <CommandSeparator />}
            </Fragment>
          ))}
        </CommandGroup>
      </CommandPopover>
    );
  },
);

SuggestionInputShadcn.displayName = 'SuggestionInputShadcn';

const SuggestionInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      value,
      onChange,
      placeholder,
      suggestions,
      'aria-label': ariaLabel,
      icon,
    },
    ref,
  ) => {
    const [isShadcnMigrationEnabled] = useFeatureFlag(
      FeatureFlags.SHADCN_MIGRATION,
    );

    if (isShadcnMigrationEnabled) {
      return (
        <SuggestionInputShadcn
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          suggestions={suggestions}
          aria-label={ariaLabel}
          icon={icon}
        />
      );
    }

    return (
      <TypeaheadInputLegacy
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        suggestions={suggestions}
      />
    );
  },
);

SuggestionInput.displayName = 'SuggestionInput';

export { SuggestionInput };
export type { Props as SuggestionInputProps };
