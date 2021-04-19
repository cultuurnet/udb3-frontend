import { Label, LabelVariants } from './Label';
import {
  Typeahead,
  typeaheadDefaultProps,
  typeaheadPropTypes,
// @ts-expect-error ts-migrate(6142) FIXME: Module './Typeahead' was resolved to '/Users/simon... Remove this comment to see the full error message
} from './Typeahead';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from './Stack';
import { forwardRef } from 'react';

const TypeaheadWithLabel = forwardRef(
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{ children?:... Remove this comment to see the full error message
      className,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type '{ childre... Remove this comment to see the full error message
      onInputChange,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'labelKey' does not exist on type '{ chil... Remove this comment to see the full error message
      onSearch,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'disabled' does not exist on type '{ chil... Remove this comment to see the full error message
      onChange,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'placeholder' does not exist on type '{ c... Remove this comment to see the full error message
      ...props
    },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'emptyLabel' does not exist on type '{ ch... Remove this comment to see the full error message
    ref,
  ) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'minLength' does not exist on type '{ chi... Remove this comment to see the full error message
    return (
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'className' does not exist on type '{ chi... Remove this comment to see the full error message
      <Stack {...getStackProps(props)}>
        {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type '{ chil... Remove this comment to see the full error message */}
        <Label htmlFor={id} variant={LabelVariants.BOLD}>
          {label}
        </Label>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Typeahead
          id={id}
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          options={options}
          labelKey={labelKey}
          disabled={disabled}
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

TypeaheadWithLabel.propTypes = {
  ...stackPropTypes,
  ...typeaheadPropTypes,
};

TypeaheadWithLabel.defaultProps = {
  ...typeaheadDefaultProps,
  label: '',
};

export { TypeaheadWithLabel };
