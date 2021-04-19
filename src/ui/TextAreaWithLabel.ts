import PropTypes from 'prop-types';
import { Label, LabelVariants } from './Label';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from './Stack';
import { TextArea } from './TextArea';

const TextAreaWithLabel = ({
  id,
  label,
  className,
  onInput,
  value,
  disabled,
  ...props
}) => {
  return (
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
    <Stack as="div" spacing={3} className={className} {...getStackProps(props)}>
      // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Label' as a type.
      <Label htmlFor={id} variant={LabelVariants.BOLD}>
        {label}
      </Label>
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      <TextArea id={id} onInput={onInput} value={value} disabled={disabled} />
    </Stack>
  );
};

TextAreaWithLabel.propTypes = {
  ...stackPropTypes,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.string,
  onInput: PropTypes.func,
  disabled: PropTypes.bool,
};

export { TextAreaWithLabel };
