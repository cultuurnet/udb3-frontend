import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { getBoxProps, boxPropTypes, Box } from './Box';

const Checkbox = ({
  id,
  name,
  checked,
  disabled,
  onToggle,
  className,
  ...props
}) => (
  <Box
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
    as="input"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'type'.
    type="checkbox"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'id'.
    id={id}
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    name={name}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'checked'.
    checked={checked}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'disabled'.
    disabled={disabled}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'onChange'. Did you mean 'onchang... Remove this comment to see the full error message
    onChange={onToggle}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'className'. Did you mean 'classN... Remove this comment to see the full error message
    className={className}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cursor'.
    cursor="pointer"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'data'.
    data-testid={props['data-testid']}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'props'.
    {...getBoxProps(props)}
  />
);

Checkbox.propTypes = {
  ...boxPropTypes,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func,
};

Checkbox.defaultprops = {
  name: '',
  checked: false,
  disabled: false,
  onToggle: () => {},
};

export { Checkbox };
