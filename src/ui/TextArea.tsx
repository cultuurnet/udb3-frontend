import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, getBoxProps } from './Box';

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
const BaseInput = (props) => <Box as="textarea" {...props} />;

const TextArea = ({
  id,
  className,
  onInput,
  value,
  disabled,
  rows,
  ...props
}) => {
  return (
    // @ts-expect-error ts-migrate(2503) FIXME: Cannot find namespace 'Form'.
    <Form.Control
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'forwardedAs'.
      forwardedAs={BaseInput}
      id={id}
      className={className}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'width'.
      width="100%"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'minHeight'.
      minHeight="4rem"
      onInput={onInput}
      value={value}
      disabled={disabled}
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'css'. Did you mean 'CSS'?
      css="border-radius: 0;"
      rows={rows}
      {...getBoxProps(props)}
    />
  );
};

TextArea.propTypes = {
  ...boxPropTypes,
  id: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.string,
  onInput: PropTypes.func,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
};

TextArea.defaultProps = {
  disabled: false,
  rows: 3,
};

export { TextArea };
