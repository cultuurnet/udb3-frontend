import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { getBoxProps, boxPropTypes, Box } from './Box';

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
const BaseInput = (props) => <Box as="input" {...props} />;

const Input = ({
  type,
  id,
  placeholder,
  onInput,
  className,
  value,
  ...props
}) => (
  // @ts-expect-error ts-migrate(2503) FIXME: Cannot find namespace 'Form'.
  <Form.Control
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'forwardedAs'.
    forwardedAs={BaseInput}
    id={id}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'id'.
    type={type}
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    placeholder={placeholder}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'className'. Did you mean 'classN... Remove this comment to see the full error message
    className={className}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'maxWidth'.
    maxWidth="43rem"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'css'.
    css="border-radius: 0;"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'onInput'.
    onInput={onInput}
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    value={value}
    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    {...getBoxProps(props)}
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'props'.
  />
);

const inputPropTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onInput: PropTypes.func,
};

Input.propTypes = {
  ...boxPropTypes,
  ...inputPropTypes,
};

Input.defaultProps = {
  type: 'text',
};

export { Input, inputPropTypes };
