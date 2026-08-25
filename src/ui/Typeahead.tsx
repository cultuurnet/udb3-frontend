import { uniqueId } from 'lodash';
import type { FocusEvent, ForwardedRef, ReactNode } from 'react';
import {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { CommandPopover } from '@/ui/CommandPopover';
import { Highlighter } from '@/ui/Highlighter';
import { Icon, Icons } from '@/ui/Icon';

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from './shadcn/command';
import { cn } from './shadcn/utils';
import { Spinner, SpinnerSizes } from './Spinner';
import type { TypeaheadLegacyElement } from './TypeaheadLegacy';
import { TypeaheadLegacy } from './TypeaheadLegacy';

const SEARCH_DELAY = 275;

type TypeaheadOption = string | Record<string, any>;

type NewEntry = { customOption: boolean; id: string; label: string };

const isNewEntry = (value: any): value is NewEntry => !!value?.customOption;

const getOptionLabel = <T extends TypeaheadOption>(
  option: T,
  labelKey?: string | ((option: T) => string),
): string => {
  const stringLabelKey = typeof labelKey === 'string' ? labelKey : 'label';

  if (typeof option !== 'string' && isNewEntry(option)) {
    return String(option[stringLabelKey] ?? '');
  }
  if (typeof labelKey === 'function') return labelKey(option);
  if (typeof option === 'string') return option;
  return String(option?.[stringLabelKey] ?? '');
};

type TypeaheadElement = { clear: () => void };

type Props<T extends TypeaheadOption = TypeaheadOption> = {
  id?: string;
  name?: string;
  className?: string;
  inputRequired?: boolean;
  disabled?: boolean;
  placeholder?: string;
  isInvalid?: boolean;
  isLoading?: boolean;
  minLength?: number;
  emptyLabel?: string;
  options: T[];
  labelKey?: string | ((option: T) => string);
  selected?: T[];
  defaultInputValue?: string;
  onChange: (selected: T[]) => void;
  onInputChange?: (text: string) => void;
  onSearch?: (text: string) => void | Promise<void>;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  filterBy?: (option: T, inputValue: string) => boolean;
  renderMenuItemChildren?: (option: T, inputValue: string) => ReactNode;
  allowNew?: boolean | ((options: T[], inputValue: string) => boolean);
  newSelectionPrefix?: string;
  hideNewInputText?: boolean;
};

const TypeaheadShadcnInner = <T extends TypeaheadOption = TypeaheadOption>(
  {
    id,
    name,
    className,
    inputRequired,
    disabled = false,
    placeholder,
    isInvalid = false,
    isLoading = false,
    minLength = 3,
    emptyLabel,
    options,
    labelKey,
    selected,
    defaultInputValue,
    onChange,
    onInputChange,
    onSearch = async () => {},
    onBlur,
    onFocus,
    filterBy = () => true,
    renderMenuItemChildren,
    allowNew = false,
    newSelectionPrefix,
    hideNewInputText = false,
  }: Props<T>,
  ref: ForwardedRef<TypeaheadElement>,
) => {
  const { t } = useTranslation();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => clearTimeout(searchTimeoutRef.current);
  }, []);

  const isMountedRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(
    () =>
      defaultInputValue ??
      (selected?.[0] !== undefined
        ? getOptionLabel(selected[0], labelKey)
        : ''),
  );

  const selectedLabel =
    selected === undefined
      ? undefined
      : selected[0] !== undefined
        ? getOptionLabel(selected[0], labelKey)
        : '';

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (selectedLabel === undefined) return;
    setText(selectedLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLabel]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      clearTimeout(searchTimeoutRef.current);
      setText('');
      setIsFocused(false);
    },
  }));

  const visibleOptions =
    text.length >= minLength
      ? options.filter((option) => filterBy(option, text))
      : [];

  const isExactMatch = visibleOptions.some(
    (option) =>
      getOptionLabel(option, labelKey).toLowerCase() === text.toLowerCase(),
  );

  const canAllowNew =
    !isLoading &&
    !!text &&
    text.length >= minLength &&
    !isExactMatch &&
    (typeof allowNew === 'function'
      ? allowNew(visibleOptions, text)
      : allowNew);

  const hasMatches =
    visibleOptions.length > 0 ||
    canAllowNew ||
    (!isLoading && text.length >= minLength);

  const handleInputChange = (value: string) => {
    setText(value);
    onInputChange?.(value);
    setIsFocused(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length >= minLength) {
      searchTimeoutRef.current = setTimeout(
        () => onSearch(value),
        SEARCH_DELAY,
      );
    }
  };

  const handleSelect = (option: T) => {
    setText(getOptionLabel(option, labelKey));
    setIsFocused(false);
    onChange([option]);
  };

  const handleSelectNew = () => {
    const stringLabelKey = typeof labelKey === 'string' ? labelKey : 'label';
    const newEntry = {
      customOption: true,
      id: uniqueId('new-id-'),
      [stringLabelKey]: text,
    } as unknown as T;
    setIsFocused(false);
    onChange([newEntry]);
  };

  return (
    <CommandPopover
      open={isFocused && hasMatches}
      onOpenChange={(open) => !open && setIsFocused(false)}
      className={className}
      input={
        <>
          <CommandInput
            id={id}
            name={name}
            required={inputRequired}
            data-testid={name}
            disabled={disabled}
            value={text}
            onValueChange={handleInputChange}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            className="tw:text-base"
          />
          <span
            className={cn(
              'tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2',
              !isLoading && !isInvalid && 'tw:invisible',
            )}
          >
            {isLoading ? (
              <Spinner size={SpinnerSizes.SMALL} />
            ) : (
              <Icon
                name={Icons.EXCLAMATION_CIRCLE}
                width={16}
                height={16}
                className="tw:text-destructive"
              />
            )}
          </span>
        </>
      }
    >
      {!isLoading && visibleOptions.length === 0 && !canAllowNew && (
        <CommandEmpty>{emptyLabel ?? t('typeahead.no_results')}</CommandEmpty>
      )}
      {(visibleOptions.length > 0 || canAllowNew) && (
        <CommandGroup className="tw:p-0">
          {visibleOptions.map((option, index) => (
            <Fragment key={`${index}-${getOptionLabel(option, labelKey)}`}>
              <CommandItem
                value={`${index}-${getOptionLabel(option, labelKey)}`}
                onSelect={() => handleSelect(option)}
                className="tw:text-base tw:rounded-none tw:cursor-pointer"
              >
                {renderMenuItemChildren ? (
                  renderMenuItemChildren(option, text)
                ) : (
                  <Highlighter search={text}>
                    {getOptionLabel(option, labelKey)}
                  </Highlighter>
                )}
              </CommandItem>
              {(index < visibleOptions.length - 1 || canAllowNew) && (
                <CommandSeparator alwaysRender />
              )}
            </Fragment>
          ))}
          {canAllowNew && (
            <CommandItem
              value={`__new__${text}`}
              data-testid="typeahead-add-new-option"
              onSelect={handleSelectNew}
              className="tw:text-base tw:rounded-none tw:cursor-pointer tw:py-4 tw:px-6"
            >
              <span className="tw:min-w-0 tw:truncate">
                {hideNewInputText ? (
                  newSelectionPrefix
                ) : (
                  <>
                    {newSelectionPrefix}
                    <strong className="tw:font-bold">{text}</strong>
                  </>
                )}
              </span>
            </CommandItem>
          )}
        </CommandGroup>
      )}
    </CommandPopover>
  );
};

const TypeaheadShadcn = forwardRef(TypeaheadShadcnInner) as <
  T extends TypeaheadOption = TypeaheadOption,
>(
  props: Props<T> & { ref?: ForwardedRef<TypeaheadElement> },
) => ReturnType<typeof TypeaheadShadcnInner<T>>;

const TypeaheadInner = <T extends TypeaheadOption = TypeaheadOption>(
  {
    id,
    name,
    className,
    inputRequired,
    disabled,
    placeholder,
    isInvalid,
    isLoading,
    minLength,
    emptyLabel,
    options,
    labelKey,
    selected,
    defaultInputValue,
    onChange,
    onInputChange,
    onSearch,
    onBlur,
    onFocus,
    filterBy,
    renderMenuItemChildren,
    allowNew,
    newSelectionPrefix,
    hideNewInputText,
  }: Props<T>,
  ref: ForwardedRef<TypeaheadElement>,
) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );
  const shadcnRef = useRef<TypeaheadElement>(null);
  const legacyRef = useRef<TypeaheadLegacyElement>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (isShadcnMigrationEnabled) {
        shadcnRef.current?.clear();
      } else {
        legacyRef.current?.clear();
      }
    },
  }));

  if (isShadcnMigrationEnabled) {
    return (
      <TypeaheadShadcn
        ref={shadcnRef}
        id={id}
        name={name}
        className={className}
        inputRequired={inputRequired}
        disabled={disabled}
        placeholder={placeholder}
        isInvalid={isInvalid}
        isLoading={isLoading}
        minLength={minLength}
        emptyLabel={emptyLabel}
        options={options}
        labelKey={labelKey}
        selected={selected}
        defaultInputValue={defaultInputValue}
        onChange={onChange}
        onInputChange={onInputChange}
        onSearch={onSearch}
        onBlur={onBlur}
        onFocus={onFocus}
        filterBy={filterBy}
        renderMenuItemChildren={renderMenuItemChildren}
        allowNew={allowNew}
        newSelectionPrefix={newSelectionPrefix}
        hideNewInputText={hideNewInputText}
      />
    );
  }

  const legacyFilterBy = filterBy
    ? (option: T, state: { text: string }) => filterBy(option, state.text)
    : undefined;

  const legacyRenderMenuItemChildren = renderMenuItemChildren
    ? (((option: T, menuProps: { text: string }) =>
        renderMenuItemChildren(option, menuProps.text)) as any)
    : undefined;

  const legacyAllowNew =
    typeof allowNew === 'function'
      ? (options: T[], state: { text: string }) => allowNew(options, state.text)
      : allowNew;

  return (
    <TypeaheadLegacy
      ref={legacyRef}
      id={id}
      name={name}
      className={className}
      inputRequired={inputRequired}
      disabled={disabled}
      placeholder={placeholder}
      isInvalid={isInvalid}
      isLoading={isLoading}
      minLength={minLength}
      emptyLabel={emptyLabel}
      options={options}
      labelKey={labelKey}
      selected={selected}
      defaultInputValue={defaultInputValue}
      onChange={onChange}
      onInputChange={onInputChange}
      onSearch={onSearch}
      onBlur={onBlur}
      onFocus={onFocus}
      filterBy={legacyFilterBy}
      renderMenuItemChildren={legacyRenderMenuItemChildren}
      allowNew={legacyAllowNew}
      newSelectionPrefix={newSelectionPrefix}
      hideNewInputText={hideNewInputText}
    />
  );
};

const Typeahead = forwardRef(TypeaheadInner) as <
  T extends TypeaheadOption = TypeaheadOption,
>(
  props: Props<T> & { ref?: ForwardedRef<TypeaheadElement> },
) => ReturnType<typeof TypeaheadInner<T>>;

export type { NewEntry, TypeaheadElement, TypeaheadOption };
export { isNewEntry, Typeahead };
