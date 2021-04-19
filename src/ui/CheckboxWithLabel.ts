import PropTypes from 'prop-types';
import { Checkbox } from './Checkbox';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { getInlineProps, Inline, inlinePropTypes } from './Inline';
import { Label } from './Label';

const CheckboxWithLabel = ({
  id,
  name,
  checked,
  disabled,
  onToggle,
  children,
  className,
  ...props
}) => {
  return (
    <Inline
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      as="div"
      className={className}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'alignItems'.
      alignItems="center"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
      spacing={3}
      {...getInlineProps(props)}
    >
      // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Checkbox' as a type.
      <Checkbox
        id={id}
        onToggle={onToggle}
        name={name}
        checked={checked}
        // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        disabled={disabled}
      />
      // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Label' as a type.
      <Label cursor="pointer" htmlFor={id}>
        {children}
      </Label>
    </Inline>
  );
};

CheckboxWithLabel.propTypes = {
  ...inlinePropTypes,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func,
  children: PropTypes.node,
};

CheckboxWithLabel.defaultprops = {
  name: '',
  checked: false,
  disabled: false,
  onToggle: () => {},
};

export { CheckboxWithLabel };
