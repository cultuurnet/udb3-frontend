import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { getBoxProps, boxPropTypes, Box } from './Box';

const RadioButton = ({
  id,
  name,
  disabled,
  onChange,
  value,
  checked,
  className,
  ...props
}) => {
  return (
    <Box
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      as="input"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'type'.
      type="radio"
      id={id}
      name={name}
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      value={value}
      className={className}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cursor'.
      cursor="pointer"
      {...getBoxProps(props)}
    />
  );
};

const radioButtonPropTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

RadioButton.propTypes = {
  ...boxPropTypes,
  ...radioButtonPropTypes,
};

const radioButtonDefaultProps = {
  disabled: false,
};

RadioButton.defaultprops = {
  ...radioButtonDefaultProps,
};

export { RadioButton, radioButtonPropTypes, radioButtonDefaultProps };
