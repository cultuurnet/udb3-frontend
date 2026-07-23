import type { ReactNode } from 'react';
import {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Icon, Icons } from '@/ui/Icon';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/ui/shadcn/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/shadcn/popover';

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
    const inputRef = useRef<HTMLInputElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const filteredSuggestions = value
      ? suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()),
        )
      : suggestions;

    const hasMatches = filteredSuggestions.length > 0;

    const renderHighlightedSuggestion = (suggestion: string) => {
      if (!value) return suggestion;

      const matchIndex = suggestion.toLowerCase().indexOf(value.toLowerCase());
      if (matchIndex === -1) return suggestion;

      return (
        <span>
          {suggestion.slice(0, matchIndex)}
          <strong className="tw:font-bold">
            {suggestion.slice(matchIndex, matchIndex + value.length)}
          </strong>
          {suggestion.slice(matchIndex + value.length)}
        </span>
      );
    };

    return (
      <Popover
        open={isFocused && hasMatches}
        onOpenChange={(open) => !open && setIsFocused(false)}
      >
        <Command shouldFilter={false} className="tw:w-full">
          <PopoverAnchor asChild>
            <div ref={anchorRef} className="tw:w-full">
              <CommandInput
                ref={inputRef}
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
            </div>
          </PopoverAnchor>

          <PopoverContent
            forceMount
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (
                event.target instanceof Node &&
                anchorRef.current?.contains(event.target)
              ) {
                event.preventDefault();
              }
            }}
            className="tw:w-(--radix-popper-anchor-width) tw:overflow-hidden tw:border-border tw:p-0 tw:data-[state=closed]:pointer-events-none tw:data-[state=closed]:invisible"
          >
            <CommandList>
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
                      {renderHighlightedSuggestion(suggestion)}
                    </CommandItem>
                    {index < filteredSuggestions.length - 1 && (
                      <CommandSeparator />
                    )}
                  </Fragment>
                ))}
              </CommandGroup>
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
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
