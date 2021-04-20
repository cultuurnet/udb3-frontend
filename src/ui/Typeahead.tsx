import { AsyncTypeahead as BootstrapTypeahead } from 'react-bootstrap-typeahead';
import { getValueFromTheme } from './theme';

import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

import { forwardRef, Ref } from 'react';

const getValue = getValueFromTheme('typeahead');

type Props = BoxProps & {
  id: string;
  options: unknown[];
  labelKey: () => void;
  disabled: boolean;
  placeholder: string;
  emptyLabel: string;
  minLength: number;
  className: string;
  onInputChange: () => void;
  onSearch: () => void;
  onChange: () => void;
};

const Typeahead = forwardRef<Ref<HTMLDivElement>, Props>(
  (
    {
      id,
      options,
      labelKey,
      disabled,
      placeholder,
      emptyLabel,
      minLength,
      className,
      onInputChange,
      onSearch,
      onChange,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        forwardedAs={BootstrapTypeahead}
        id={id}
        options={options}
        labelKey={labelKey}
        isLoading={false}
        disabled={disabled}
        className={className}
        css={`
          .dropdown-item.active,
          .dropdown-item:active {
            color: ${getValue('active.color')};
            background-color: ${getValue('active.backgroundColor')};
            .rbt-highlight-text {
              color: ${getValue('active.color')};
            }
          }
          .rbt-highlight-text {
            font-weight: ${getValue('highlight.fontWeight')};
            background-color: ${getValue('highlight.backgroundColor')};
          }
        `}
        onSearch={onSearch}
        onInputChange={onInputChange}
        onChange={onChange}
        placeholder={placeholder}
        emptyLabel={emptyLabel}
        minLength={minLength}
        delay={275}
        highlightOnlyResult
        ref={ref}
        {...getBoxProps(props)}
      />
    );
  },
);

const typeaheadDefaultProps = {
  options: [],
  labelKey: () => {},
  onSearch: async () => {},
  disabled: false,
  minLength: 3,
};

Typeahead.defaultProps = {
  ...typeaheadDefaultProps,
};

export { Typeahead, typeaheadDefaultProps };
