import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { Box, getBoxProps } from './Box';

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
  <Form.Control
    forwardedAs={BaseInput}
    id={id}
    type={type}
    placeholder={placeholder}
    className={className}
    maxWidth="43rem"
    css="border-radius: 0;"
    onInput={onInput}
    value={value}
    {...getBoxProps(props)}
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
  ...inputPropTypes,
};

Input.defaultProps = {
  type: 'text',
};

export { Input, inputPropTypes };
