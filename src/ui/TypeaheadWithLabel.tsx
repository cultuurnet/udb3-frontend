import { Label, LabelVariants } from './Label';

import { Typeahead, typeaheadDefaultProps } from './Typeahead';
import type { TypeaheadProps } from './Typeahead';

import { getStackProps, Stack } from './Stack';
import type { StackProps } from './Stack';
import { forwardRef, Ref } from 'react';

type Props = StackProps & TypeaheadProps & { label?: string };

const TypeaheadWithLabel = forwardRef<Ref<HTMLDivElement>, Props>(
  (
    {
      id,
      label,
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
      <Stack {...getStackProps(props)}>
        <Label htmlFor={id} variant={LabelVariants.BOLD}>
          {label}
        </Label>
        <Typeahead
          id={id}
          options={options}
          labelKey={labelKey}
          disabled={disabled}
          emptyLabel={emptyLabel}
          minLength={minLength}
          placeholder={placeholder}
          className={className}
          onInputChange={onInputChange}
          onSearch={onSearch}
          onChange={onChange}
          ref={ref}
        />
      </Stack>
    );
  },
);

TypeaheadWithLabel.defaultProps = {
  ...typeaheadDefaultProps,
  label: '',
};

export { TypeaheadWithLabel };
