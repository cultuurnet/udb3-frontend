import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { AsyncTypeahead as BootstrapTypeahead } from 'react-bootstrap-typeahead';
import { getValueFromTheme } from './theme';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, getBoxProps } from './Box';
import { forwardRef } from 'react';

const getValue = getValueFromTheme('typeahead');

const Typeahead = forwardRef(
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{ children?:... Remove this comment to see the full error message
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
      <Box
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'onInputChange' does not exist on type '{... Remove this comment to see the full error message
        forwardedAs={BootstrapTypeahead}
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'onChange' does not exist on type '{ chil... Remove this comment to see the full error message
        id={id}
        options={options}
        labelKey={labelKey}
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

const typeaheadPropTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.array,
  labelKey: PropTypes.func,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  emptyLabel: PropTypes.string,
  minLength: PropTypes.number,
  className: PropTypes.string,
  onInputChange: PropTypes.func,
  onSearch: PropTypes.func,
  onChange: PropTypes.func,
};

Typeahead.propTypes = {
  ...boxPropTypes,
  ...typeaheadPropTypes,
};

const typeaheadDefaultProps = {
  options: [],
  labelKey: (item) => item,
  onSearch: async () => {},
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'item' implicitly has an 'any' type.
  disabled: false,
  minLength: 3,
};

Typeahead.defaultProps = {
  // @ts-expect-error ts-migrate(2559) FIXME: Type '{ options: never[]; labelKey: (item: any) =>... Remove this comment to see the full error message
  ...typeaheadDefaultProps,
};

export { Typeahead, typeaheadPropTypes, typeaheadDefaultProps };
